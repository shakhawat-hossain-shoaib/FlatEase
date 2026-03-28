<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckTechnicianCredentials
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (data_get($user, 'role') !== 'technician') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Technician access required.',
            ], 403);
        }

        return $next($request);
    }
}
