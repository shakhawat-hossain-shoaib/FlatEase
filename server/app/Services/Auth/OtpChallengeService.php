<?php

namespace App\Services\Auth;

use App\Models\OtpChallenge;
use App\Models\User;
use App\Notifications\OtpChallengeNotification;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class OtpChallengeService
{
    public const PURPOSE_REGISTRATION = 'registration_verification';
    public const PURPOSE_PASSWORD_RESET = 'password_reset';

    private const DEFAULT_OTP_TTL_MINUTES = 10;
    private const DEFAULT_MAX_ATTEMPTS = 5;
    private const DEFAULT_MAX_RESENDS = 3;
    private const RESEND_COOLDOWN_SECONDS = 60;
    private const LOCK_MINUTES = 15;

    public function issueRegistrationChallenge(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'preferred_contact_method' => $data['preferred_contact_method'],
                'password' => Hash::make($data['password']),
                'role' => 'tenant',
                'account_status' => 'pending_verification',
                'email_verified_at' => null,
                'otp_locked_until' => null,
            ]);

            $challenge = $this->createChallenge($user, self::PURPOSE_REGISTRATION, $this->resolveChannel($data), [
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $this->deliverChallenge($challenge, (string) $challenge->getAttribute('plain_otp'));

            return $this->buildChallengeResponse($user, $challenge);
        });
    }

    public function issuePasswordResetChallenge(array $data): array
    {
        $user = $this->findUserForReset($data['identifier']);

        if (! $user) {
            return [
                'success' => true,
                'status' => 'reset_link_sent',
                'message' => 'If the account exists, a reset code will be sent shortly.',
                'verification_required' => false,
            ];
        }

        $channel = $this->resolveResetChannel($user, $data['preferred_contact_method'] ?? null);
        $destination = $channel === 'sms' ? $user->phone : $user->email;

        if (! $destination) {
            return [
                'success' => true,
                'status' => 'reset_link_sent',
                'message' => 'If the account exists, a reset code will be sent shortly.',
                'verification_required' => false,
            ];
        }

        $challenge = $this->createChallenge($user, self::PURPOSE_PASSWORD_RESET, $channel, [
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ], $destination);

        $this->deliverChallenge($challenge, (string) $challenge->getAttribute('plain_otp'));

        return $this->buildChallengeResponse($user, $challenge);
    }

    public function verifyChallenge(string $challengeToken, string $otp): array
    {
        $challenge = $this->findChallengeByToken($challengeToken);

        if (! $challenge) {
            return [
                'success' => false,
                'status' => 'invalid',
                'message' => 'The verification code is invalid.',
            ];
        }

        return DB::transaction(function () use ($challenge, $otp) {
            $challenge = OtpChallenge::query()->lockForUpdate()->findOrFail($challenge->id);

            $state = $this->refreshChallengeState($challenge);
            if ($state !== null) {
                return $state;
            }

            if (! hash_equals($challenge->otp_hash, $this->hashOtp($challenge, $otp))) {
                $challenge->failed_attempts++;

                if ($challenge->failed_attempts >= $challenge->max_attempts) {
                    return $this->lockChallenge($challenge, 'too_many_attempts');
                }

                $challenge->save();

                return [
                    'success' => false,
                    'status' => 'invalid',
                    'message' => 'The verification code is invalid.',
                    'attempts_remaining' => max(0, $challenge->max_attempts - $challenge->failed_attempts),
                ];
            }

            $challenge->status = 'verified';
            $challenge->verified_at = now();
            $challenge->locked_until = null;
            $challenge->save();

            if ($challenge->user) {
                $challenge->user->forceFill([
                    'account_status' => 'active',
                    'otp_locked_until' => null,
                    'email_verified_at' => now(),
                ])->save();
            }

            return [
                'success' => true,
                'status' => 'verified',
                'message' => 'Verification completed successfully.',
                'user' => $this->userPayload($challenge->user),
                'purpose' => $challenge->purpose,
            ];
        });
    }

    public function completePasswordReset(string $challengeToken, string $otp, string $password): array
    {
        $verification = $this->verifyChallenge($challengeToken, $otp);

        if (! ($verification['success'] ?? false)) {
            return $verification;
        }

        $challenge = $this->findChallengeByToken($challengeToken);

        if (! $challenge || $challenge->purpose !== self::PURPOSE_PASSWORD_RESET || ! $challenge->user) {
            return [
                'success' => false,
                'status' => 'invalid',
                'message' => 'The password reset code is invalid.',
            ];
        }

        $challenge->user->forceFill([
            'password' => Hash::make($password),
            'remember_token' => Str::random(60),
        ])->save();

        return [
            'success' => true,
            'status' => 'password_reset',
            'message' => 'Password updated successfully.',
            'user' => $this->userPayload($challenge->user),
        ];
    }

    public function resendChallenge(string $challengeToken): array
    {
        $challenge = $this->findChallengeByToken($challengeToken);

        if (! $challenge) {
            return [
                'success' => false,
                'status' => 'invalid',
                'message' => 'The verification session is invalid.',
            ];
        }

        return DB::transaction(function () use ($challenge) {
            $challenge = OtpChallenge::query()->lockForUpdate()->findOrFail($challenge->id);

            $state = $this->refreshChallengeState($challenge);
            if ($state !== null) {
                return $state;
            }

            if ($challenge->resend_available_at && now()->lt($challenge->resend_available_at)) {
                return [
                    'success' => false,
                    'status' => 'cooldown',
                    'message' => 'Please wait before requesting another code.',
                    'retry_after_seconds' => max(0, now()->diffInSeconds($challenge->resend_available_at)),
                ];
            }

            if ($challenge->resend_count >= $challenge->max_resends) {
                return $this->lockChallenge($challenge, 'resend_limit');
            }

            $plainOtp = $this->generateOtp();
            $challenge->otp_hash = $this->hashOtp($challenge, $plainOtp);
            $challenge->failed_attempts = 0;
            $challenge->resend_count++;
            $challenge->resend_available_at = now()->addSeconds(self::RESEND_COOLDOWN_SECONDS);
            $challenge->expires_at = now()->addMinutes(self::DEFAULT_OTP_TTL_MINUTES);
            $challenge->status = 'pending';
            $challenge->locked_until = null;
            $challenge->save();

            $this->deliverChallenge($challenge, $plainOtp);

            return $this->buildChallengeResponse($challenge->user, $challenge);
        });
    }

    public function status(string $challengeToken): array
    {
        $challenge = $this->findChallengeByToken($challengeToken);

        if (! $challenge) {
            return [
                'success' => false,
                'status' => 'invalid',
                'message' => 'The verification session is invalid.',
            ];
        }

        $state = $this->refreshChallengeState($challenge);
        if ($state !== null) {
            return $state;
        }

        return [
            'success' => true,
            'status' => 'pending',
            'message' => 'Verification is pending.',
            'expires_in_seconds' => max(0, now()->diffInSeconds($challenge->expires_at)),
            'resend_available_in_seconds' => $challenge->resend_available_at
                ? max(0, now()->diffInSeconds($challenge->resend_available_at))
                : 0,
            'attempts_remaining' => max(0, $challenge->max_attempts - $challenge->failed_attempts),
        ];
    }

    public function findChallengeByToken(string $challengeToken): ?OtpChallenge
    {
        return OtpChallenge::query()
            ->where('challenge_token_hash', $this->hashToken($challengeToken))
            ->first();
    }

    private function createChallenge(User $user, string $purpose, string $channel, array $meta = [], ?string $destination = null): OtpChallenge
    {
        $plainOtp = $this->generateOtp();
        $plainToken = Str::random(64);

        $challenge = OtpChallenge::create([
            'user_id' => $user->id,
            'purpose' => $purpose,
            'channel' => $channel,
            'destination' => $destination ?? $this->resolveDestination($user, $channel),
            'challenge_token_hash' => $this->hashToken($plainToken),
            'otp_hash' => 'pending',
            'failed_attempts' => 0,
            'max_attempts' => self::DEFAULT_MAX_ATTEMPTS,
            'resend_count' => 0,
            'max_resends' => self::DEFAULT_MAX_RESENDS,
            'resend_available_at' => now()->addSeconds(self::RESEND_COOLDOWN_SECONDS),
            'expires_at' => now()->addMinutes(self::DEFAULT_OTP_TTL_MINUTES),
            'status' => 'pending',
            'request_ip' => $meta['ip'] ?? null,
            'user_agent' => $meta['user_agent'] ?? null,
            'meta' => $meta,
        ]);

        $challenge->forceFill([
            'otp_hash' => $this->hashOtp($challenge, $plainOtp),
        ])->save();

        $challenge->setAttribute('plain_token', $plainToken);
        $challenge->setAttribute('plain_otp', $plainOtp);

        return $challenge;
    }

    private function deliverChallenge(OtpChallenge $challenge, string $otp): void
    {
        if ($challenge->channel === 'sms') {
            $this->sendSms($challenge->destination, $otp, $challenge->purpose);

            return;
        }

        Notification::route('mail', $challenge->destination)
            ->notify(new OtpChallengeNotification($challenge->purpose, $otp, self::DEFAULT_OTP_TTL_MINUTES));
    }

    private function sendSms(string $destination, string $otp, string $purpose): void
    {
        $accountSid = (string) env('TWILIO_ACCOUNT_SID', '');
        $authToken = (string) env('TWILIO_AUTH_TOKEN', '');
        $fromNumber = (string) env('TWILIO_FROM_NUMBER', '');

        if ($accountSid === '' || $authToken === '' || $fromNumber === '') {
            throw new RuntimeException('SMS delivery is not configured. Set Twilio credentials to enable SMS OTP delivery.');
        }

        $message = $purpose === self::PURPOSE_PASSWORD_RESET
            ? 'FlatEase password reset code: ' . $otp
            : 'FlatEase verification code: ' . $otp;

        $response = Http::withBasicAuth($accountSid, $authToken)
            ->asForm()
            ->post('https://api.twilio.com/2010-04-01/Accounts/' . $accountSid . '/Messages.json', [
                'From' => $fromNumber,
                'To' => $destination,
                'Body' => $message,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('SMS delivery failed.');
        }
    }

    private function buildChallengeResponse(?User $user, OtpChallenge $challenge): array
    {
        return [
            'success' => true,
            'status' => 'verification_required',
            'message' => $challenge->purpose === self::PURPOSE_PASSWORD_RESET
                ? 'A password reset code has been sent.'
                : 'A verification code has been sent.',
            'challenge_token' => $challenge->getAttribute('plain_token'),
            'purpose' => $challenge->purpose,
            'channel' => $challenge->channel,
            'masked_destination' => $this->maskDestination($challenge->destination),
            'expires_in_seconds' => max(0, now()->diffInSeconds($challenge->expires_at)),
            'resend_available_in_seconds' => max(0, now()->diffInSeconds($challenge->resend_available_at)),
            'attempts_remaining' => max(0, $challenge->max_attempts - $challenge->failed_attempts),
            'user' => $this->userPayload($user),
        ];
    }

    private function refreshChallengeState(OtpChallenge $challenge): ?array
    {
        if ($challenge->status === 'verified') {
            return [
                'success' => false,
                'status' => 'already_verified',
                'message' => 'The code has already been verified.',
            ];
        }

        if ($challenge->locked_until && now()->lt($challenge->locked_until)) {
            return [
                'success' => false,
                'status' => 'locked',
                'message' => 'Verification is temporarily locked. Try again later.',
                'locked_until' => $challenge->locked_until->toISOString(),
                'retry_after_seconds' => max(0, now()->diffInSeconds($challenge->locked_until)),
            ];
        }

        if ($challenge->expires_at->isPast()) {
            $challenge->forceFill([
                'status' => 'expired',
            ])->save();

            return [
                'success' => false,
                'status' => 'expired',
                'message' => 'The verification code has expired.',
            ];
        }

        return null;
    }

    private function lockChallenge(OtpChallenge $challenge, string $reason): array
    {
        $lockedUntil = now()->addMinutes(self::LOCK_MINUTES);

        $challenge->forceFill([
            'status' => 'locked',
            'locked_until' => $lockedUntil,
        ])->save();

        if ($challenge->user) {
            $challenge->user->forceFill([
                'account_status' => 'locked',
                'otp_locked_until' => $lockedUntil,
            ])->save();
        }

        return [
            'success' => false,
            'status' => 'locked',
            'message' => $reason === 'resend_limit'
                ? 'Too many resend requests. Please try again later.'
                : 'Too many invalid attempts. Your account is temporarily locked.',
            'locked_until' => $lockedUntil->toISOString(),
            'retry_after_seconds' => self::LOCK_MINUTES * 60,
        ];
    }

    private function hashToken(string $token): string
    {
        return hash('sha256', $token . '|' . (string) config('app.key'));
    }

    private function hashOtp(OtpChallenge $challenge, string $otp): string
    {
        return $this->hashOtpValue((string) $challenge->id, $otp);
    }

    private function hashOtpValue(string $seed, string $otp): string
    {
        return hash_hmac('sha256', trim($otp) . '|' . $seed, (string) config('app.key'));
    }

    private function generateOtp(): string
    {
        return (string) random_int(100000, 999999);
    }

    private function maskDestination(string $destination): string
    {
        if (filter_var($destination, FILTER_VALIDATE_EMAIL)) {
            [$localPart, $domain] = explode('@', $destination, 2);
            $maskedLocal = strlen($localPart) > 2 ? substr($localPart, 0, 2) . str_repeat('*', max(1, strlen($localPart) - 2)) : '**';

            return $maskedLocal . '@' . $domain;
        }

        $digits = preg_replace('/\D+/', '', $destination) ?? '';
        if ($digits === '') {
            return '***';
        }

        $lastFour = substr($digits, -4);

        return str_repeat('*', max(0, strlen($digits) - 4)) . $lastFour;
    }

    private function resolveChannel(array $data): string
    {
        return $data['preferred_contact_method'] === 'sms' ? 'sms' : 'email';
    }

    private function resolveResetChannel(User $user, ?string $preferredMethod): string
    {
        if ($preferredMethod === 'sms' && $user->phone) {
            return 'sms';
        }

        if ($preferredMethod === 'email' || ! $user->phone) {
            return 'email';
        }

        return $user->preferred_contact_method === 'sms' && $user->phone ? 'sms' : 'email';
    }

    private function resolveDestination(User $user, string $channel): string
    {
        return $channel === 'sms' ? (string) $user->phone : (string) $user->email;
    }

    private function findUserForReset(string $identifier): ?User
    {
        return User::query()
            ->where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();
    }

    private function userPayload(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }
}
