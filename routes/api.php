<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FrontEndValidationController;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\WalletTranactionController; 

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/check_public_url_availability', [FrontEndValidationController::class, 'checkUsername']); //->name('validate.checkUsername'); 

// Route::get('/pesapal-ipn/log-information', [FrontEndValidationController::class, 'checkUsername']); //->name('validate.checkUsername') 

Route::post('/pesapal/initiate', [PesapalController::class, 'initiatePayment']);


Route::post('/pesapal/check_transaction_status/', [PesapalController::class, 'checkStatus']);

Route::post('/testing/payment', [WalletTranactionController::class,'createTransaction']); 