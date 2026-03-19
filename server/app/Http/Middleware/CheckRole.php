<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $guard = null;
        $currentRole = null;

        if (Auth::guard('admin_api')->check()) {
            $guard = 'admin_api';
            $currentRole = 'admin';
        } elseif (Auth::guard('tenant_api')->check()) {
            $guard = 'tenant_api';
            $currentRole = 'tenant';
        }

        if (! $guard || ! $currentRole) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (! in_array($currentRole, $roles, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->attributes->set('auth_guard', $guard);

        return $next($request);
    }
}
