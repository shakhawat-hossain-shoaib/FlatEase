<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Auth\OtpChallengeService;

class PasswordResetLinkController extends Controller
{
    private OtpChallengeService $otpChallenges;

    public function __construct(OtpChallengeService $otpChallenges)
    {
        $this->otpChallenges = $otpChallenges;
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'identifier' => ['required', 'string'],
            'preferred_contact_method' => ['nullable', 'in:email,sms'],
        ]);

        $response = $this->otpChallenges->issuePasswordResetChallenge([
            'identifier' => $request->string('identifier')->toString(),
            'preferred_contact_method' => $request->string('preferred_contact_method')->toString() ?: null,
        ]);

        return response()->json($response, ($response['verification_required'] ?? false) ? 200 : 200);
    }
}
