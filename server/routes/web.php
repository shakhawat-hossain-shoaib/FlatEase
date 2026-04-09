<?php

use Illuminate\Http\Request;
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

Route::match(['get', 'post'], '/success', function (Request $request) {
    return response()->json([
        'status' => 'success',
        'message' => 'SSLCommerz payment succeeded.',
        'transaction_id' => $request->input('tran_id'),
    ]);
});

Route::match(['get', 'post'], '/fail', function (Request $request) {
    return response()->json([
        'status' => 'failed',
        'message' => 'SSLCommerz payment failed.',
        'transaction_id' => $request->input('tran_id'),
    ]);
});

Route::match(['get', 'post'], '/cancel', function (Request $request) {
    return response()->json([
        'status' => 'cancelled',
        'message' => 'SSLCommerz payment was cancelled.',
        'transaction_id' => $request->input('tran_id'),
    ]);
});

Route::post('/ipn', function (Request $request) {
    return response()->json([
        'status' => 'received',
        'message' => 'SSLCommerz IPN callback received.',
        'transaction_id' => $request->input('tran_id'),
    ]);
});

Route::get('{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');

require __DIR__ . '/auth.php';
