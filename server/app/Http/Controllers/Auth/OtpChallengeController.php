<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\OtpChallengeService;
use Illuminate\Http\Request;

class OtpChallengeController extends Controller
{
    private OtpChallengeService $otpChallenges;

    public function __construct(OtpChallengeService $otpChallenges)
    {
        $this->otpChallenges = $otpChallenges;
    }

    public function verify(Request $request)
    {
        $request->validate([
            'challenge_token' => ['required', 'string'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $result = $this->otpChallenges->verifyChallenge($request->string('challenge_token')->toString(), $request->string('otp')->toString());

        if (! ($result['success'] ?? false)) {
            return response()->json($result, $this->statusFor($result['status'] ?? 'invalid'));
        }

        if (! empty($result['user']['id'])) {
            auth()->loginUsingId((int) $result['user']['id']);
            $request->session()->regenerate();
        }

        return response()->json($result, 200);
    }

    public function resend(Request $request)
    {
        $request->validate([
            'challenge_token' => ['required', 'string'],
        ]);

        $result = $this->otpChallenges->resendChallenge($request->string('challenge_token')->toString());

        return response()->json($result, $this->statusFor($result['status'] ?? 'invalid'));
    }

    public function status(Request $request)
    {
        $request->validate([
            'challenge_token' => ['required', 'string'],
        ]);

        $result = $this->otpChallenges->status($request->string('challenge_token')->toString());

        return response()->json($result, $this->statusFor($result['status'] ?? 'invalid'));
    }

    private function statusFor(string $status): int
    {
        return match ($status) {
            'locked' => 423,
            'expired' => 410,
            'cooldown' => 429,
            'invalid' => 422,
            default => 200,
        };
    }
}
