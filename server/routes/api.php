<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Api\AdminBuildingController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TenantDocumentController;

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

Route::middleware(['auth:sanctum', 'check.admin'])->group(function () {
    Route::get('/admin/users/assignable', [UserManagementController::class, 'assignable']);
    Route::get('/admin/users/assignable-tenants', [UserManagementController::class, 'assignableTenants']);
    Route::post('/admin/users', [UserManagementController::class, 'store']);
    Route::post('/admin/tenants/create-with-assignment', [UserManagementController::class, 'createTenantWithAssignment']);

    Route::get('/admin/buildings', [AdminBuildingController::class, 'index']);
    Route::post('/admin/buildings', [AdminBuildingController::class, 'store']);
    Route::get('/admin/buildings/{buildingId}', [AdminBuildingController::class, 'show']);
    Route::patch('/admin/buildings/{buildingId}', [AdminBuildingController::class, 'update']);
    Route::delete('/admin/buildings/{buildingId}', [AdminBuildingController::class, 'destroy']);
    Route::get('/admin/buildings/{buildingId}/vacant-units', [AdminBuildingController::class, 'getVacantUnits']);
    Route::post('/admin/units/{unitId}/assign', [AdminBuildingController::class, 'assignTenant']);
    Route::patch('/admin/assignments/{assignmentId}/end', [AdminBuildingController::class, 'unassignTenant']);

    Route::get('/admin/tenants/{tenantId}/documents', [TenantDocumentController::class, 'adminIndexByTenant']);
    Route::patch('/admin/documents/{documentId}/status', [TenantDocumentController::class, 'adminUpdateStatus']);
    Route::get('/admin/documents/{documentId}/download', [TenantDocumentController::class, 'download']);
});

// Complaint routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
    Route::patch('/complaints/{id}/resolve', [ComplaintController::class, 'tenantMarkResolved']);
    Route::get('/complaints/{id}/comments', [ComplaintController::class, 'comments']);
    Route::post('/complaints/{id}/comments', [ComplaintController::class, 'addComment']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
});

// Admin complaint routes
Route::middleware(['auth:sanctum', 'check.admin'])->group(function () {
    Route::get('/admin/complaints', [ComplaintController::class, 'adminIndex']);
    Route::get('/admin/complaints/summary', [ComplaintController::class, 'summary']);
    Route::get('/admin/technicians', [ComplaintController::class, 'technicians']);
    Route::patch('/admin/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
    Route::patch('/admin/complaints/{id}/assign', [ComplaintController::class, 'assignTechnicians']);
});

Route::middleware(['auth:sanctum', 'check.technician'])->group(function () {
    Route::get('/technician/complaints', [ComplaintController::class, 'technicianIndex']);
    Route::patch('/technician/complaints/{id}/status', [ComplaintController::class, 'technicianUpdateStatus']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/tenant/documents/checklist', [TenantDocumentController::class, 'checklist']);
    Route::get('/tenant/documents', [TenantDocumentController::class, 'index']);
    Route::post('/tenant/documents', [TenantDocumentController::class, 'store']);
    Route::delete('/tenant/documents/{documentId}', [TenantDocumentController::class, 'destroy']);
    Route::get('/tenant/documents/{documentId}/download', [TenantDocumentController::class, 'download']);
});
