<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/session', [SessionController::class, 'getSession']);
Route::middleware(['auth:sanctum', 'check.admin'])->group(function () {
    Route::post('/session', [SessionController::class, 'createSession']);
    Route::put('/session', [SessionController::class, 'updateSession']);
    Route::post('/sessions', [SessionController::class, 'viewSessions']);
    Route::get('/admin/users/assignable', [UserManagementController::class, 'assignable']);
    Route::post('/admin/users', [UserManagementController::class, 'store']);
});
Route::post('/attendance', [SessionController::class, 'submitAttendance']);

// Complaint routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
    Route::get('/complaints/{id}/comments', [ComplaintController::class, 'comments']);
    Route::post('/complaints/{id}/comments', [ComplaintController::class, 'addComment']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
});

// Admin complaint routes
Route::middleware(['auth:sanctum', 'check.admin'])->group(function () {
    Route::get('/admin/complaints', [ComplaintController::class, 'adminIndex']);
    Route::get('/admin/complaints/summary', [ComplaintController::class, 'summary']);
    Route::patch('/admin/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
    Route::patch('/admin/complaints/{id}/assign', [ComplaintController::class, 'assign']);
});
