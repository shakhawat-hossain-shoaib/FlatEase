<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    Route::middleware('auth:admin_api,tenant_api')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware(['auth:admin_api', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Admin access granted',
        ]);
    });
});

Route::middleware(['auth:tenant_api', 'role:tenant'])->prefix('tenant')->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Tenant access granted',
        ]);
    });
});
