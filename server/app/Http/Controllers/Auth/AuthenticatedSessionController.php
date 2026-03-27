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

        $redirectPath = $user && $user->role === 'admin' ? '/admin' : '/tenant';

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
