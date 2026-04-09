<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules;
use App\Services\Auth\OtpChallengeService;

class RegisteredUserController extends Controller
{
    private OtpChallengeService $otpChallenges;

    public function __construct(OtpChallengeService $otpChallenges)
    {
        $this->otpChallenges = $otpChallenges;
    }

    /**
     * Handle an incoming registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:20', 'unique:users,phone', 'required_if:preferred_contact_method,sms'],
            'preferred_contact_method' => ['required', 'in:email,sms'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Public registration must not accept role elevation input.
            'role' => ['prohibited'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $response = $this->otpChallenges->issueRegistrationChallenge([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'preferred_contact_method' => $validated['preferred_contact_method'],
            'password' => $validated['password'],
        ]);

        return response()->json([
            ...$response,
        ], 201);
    }
}
