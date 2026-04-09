<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use App\Services\Auth\OtpChallengeService;

class NewPasswordController extends Controller
{
    private OtpChallengeService $otpChallenges;

    public function __construct(OtpChallengeService $otpChallenges)
    {
        $this->otpChallenges = $otpChallenges;
    }

    /**
     * Handle an incoming new password request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'challenge_token' => ['required', 'string'],
            'otp' => ['required', 'string', 'size:6'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $response = $this->otpChallenges->completePasswordReset(
            $request->string('challenge_token')->toString(),
            $request->string('otp')->toString(),
            $request->string('password')->toString()
        );

        return response()->json($response, ($response['success'] ?? false) ? 200 : 422);
    }
}
