<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
