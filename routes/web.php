<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [WelcomeController::class, 'index']);

// Admin dashboard route (renders resources/js/Pages/AdminDashboard.jsx)
Route::get('/admin/dashboard', function () {
	return Inertia::render('AdminDashboard');
})->name('admin.dashboard');

require __DIR__ . '/auth.php';
