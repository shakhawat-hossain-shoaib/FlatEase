<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     *
     * @param  \App\Http\Requests\Auth\LoginRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(LoginRequest $request)
    {
        $this->ensureLocalDefaultUsers();

        try {
            $request->authenticate();
        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials.',
                'errors' => $exception->errors(),
            ], 401);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user && in_array($user->account_status, ['pending_verification', 'locked'], true)) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => false,
                'message' => $user->account_status === 'locked'
                    ? 'Your account is temporarily locked. Please complete OTP verification or try again later.'
                    : 'Your account needs OTP verification before login.',
                'status' => $user->account_status === 'locked' ? 'locked' : 'verification_required',
            ], $user->account_status === 'locked' ? 423 : 403);
        }

        $redirectPath = '/tenant';
        if ($user && $user->role === 'admin') {
            $redirectPath = '/admin';
        } elseif ($user && $user->role === 'technician') {
            $redirectPath = '/technician';
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'redirectPath' => $redirectPath,
        ], 200);
    }

    /**
     * Keep local dev bootstrap users consistent so login works even when seeders were not run.
     */
    private function ensureLocalDefaultUsers(): void
    {
        if (!app()->environment('local')) {
            return;
        }

        $accounts = [
            [
                'name' => env('DEFAULT_ADMIN_NAME', 'Admin'),
                'email' => env('DEFAULT_ADMIN_EMAIL', 'admin@flatease.com'),
                'password' => env('DEFAULT_ADMIN_PASSWORD', 'adminflatease'),
                'role' => 'admin',
            ],
            [
                'name' => env('DEFAULT_TENANT_NAME', 'Partha'),
                'email' => env('DEFAULT_TENANT_EMAIL', 'partha@gmail.com'),
                'password' => env('DEFAULT_TENANT_PASSWORD', '12345678'),
                'role' => 'tenant',
            ],
            [
                'name' => env('DEFAULT_TECHNICIAN_NAME', 'Default Technician'),
                'email' => env('DEFAULT_TECHNICIAN_EMAIL', 'tech.default@flatease.local'),
                'password' => env('DEFAULT_TECHNICIAN_PASSWORD', 'Technician@123456'),
                'role' => 'technician',
            ],
        ];

        foreach ($accounts as $account) {
            if (!filter_var($account['email'], FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make($account['password']),
                    'role' => $account['role'],
                    'account_status' => 'active',
                    'email_verified_at' => now(),
                ]
            );
        }
    }

    /**
     * Destroy an authenticated session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ], 200);
    }
}
