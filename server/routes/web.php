<?php

use App\Http\Controllers\Api\TenantPaymentController;
use Illuminate\Support\Facades\Route;

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

// Route::get('/', function () {
//     return ['Laravel' => app()->version()];
// });

Route::match(['get', 'post'], '/success', [TenantPaymentController::class, 'sslCommerzSuccess']);
Route::match(['get', 'post'], '/fail', [TenantPaymentController::class, 'sslCommerzFail']);
Route::match(['get', 'post'], '/cancel', [TenantPaymentController::class, 'sslCommerzCancel']);
Route::post('/ipn', [TenantPaymentController::class, 'sslCommerzIpn']);

Route::get('{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');

require __DIR__ . '/auth.php';
