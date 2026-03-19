<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:admin_api,tenant_api', ['except' => ['login', 'register']]);
    }

    /**
     * Register a User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|between:2,100',
            'email' => 'required|string|email|max:100',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,tenant',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $email = (string) $request->email;
        if ($this->emailExistsAcrossRoles($email)) {
            return response()->json([
                'message' => 'The email has already been taken.',
            ], 422);
        }

        $role = (string) $request->role;
        $model = $role === 'admin' ? new Admin() : new Tenant();

        $model->name = (string) $request->name;
        $model->email = $email;
        $model->password = Hash::make((string) $request->password);
        $model->save();

        $guard = $this->guardForRole($role);
        $token = Auth::guard($guard)->attempt([
            'email' => $email,
            'password' => (string) $request->password,
        ]);

        if (! $token) {
            return response()->json([
                'message' => 'Registration succeeded but token generation failed.',
            ], 500);
        }

        return $this->createTokenResponse($token, $guard, 201);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,tenant',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guard = $this->guardForRole((string) $request->role);
        $credentials = [
            'email' => (string) $request->email,
            'password' => (string) $request->password,
        ];

        if (! $token = Auth::guard($guard)->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return $this->createTokenResponse($token, $guard);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        $guard = $this->resolveGuardFromRequest();
        if (! $guard) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'user' => $this->mapUser(Auth::guard($guard)->user(), $this->roleForGuard($guard)),
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        $guard = $this->resolveGuardFromRequest();
        if (! $guard) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Auth::guard($guard)->logout();
        return response()->json(['message' => 'User successfully signed out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        $guard = $this->resolveGuardFromRequest();
        if (! $guard) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $this->createTokenResponse(Auth::guard($guard)->refresh(), $guard);
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function createTokenResponse($token, string $guard, int $status = 200)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard($guard)->factory()->getTTL() * 60,
            'user' => $this->mapUser(Auth::guard($guard)->user(), $this->roleForGuard($guard)),
        ], $status);
    }

    protected function guardForRole(string $role): string
    {
        return $role === 'admin' ? 'admin_api' : 'tenant_api';
    }

    protected function roleForGuard(string $guard): string
    {
        return $guard === 'admin_api' ? 'admin' : 'tenant';
    }

    protected function resolveGuardFromRequest(): ?string
    {
        if (Auth::guard('admin_api')->check()) {
            return 'admin_api';
        }

        if (Auth::guard('tenant_api')->check()) {
            return 'tenant_api';
        }

        return null;
    }

    protected function emailExistsAcrossRoles(string $email): bool
    {
        return Admin::where('email', $email)->exists() || Tenant::where('email', $email)->exists();
    }

    protected function mapUser($user, string $role): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
        ];
    }
}
