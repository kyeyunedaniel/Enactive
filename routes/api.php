<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FrontEndValidationController;
use App\Http\Controllers\PesapalController;
use App\Http\Controllers\WalletTranactionController; 
use App\Http\Controllers\WalletSyncController; 

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


Route::middleware(['api'])->group(function () {
    // Main sync endpoint - sync all pending transactions
Route::post('/wallet-sync/pending', [WalletSyncController::class, 'syncAllPendingTransactions']);

// Sync transactions for a specific user
Route::post('/wallet-sync/user/{userId}', [WalletSyncController::class, 'syncUserTransactions']);

// Sync transactions for a specific wallet
Route::post('/wallet-sync/wallet/{walletId}', [WalletSyncController::class, 'syncWalletTransactions']);

// Sync a specific transaction by ID
Route::post('/wallet-sync/transaction/{transactionId}', [WalletSyncController::class, 'syncSpecificTransaction']);

// Get sync statistics
Route::get('/wallet-sync/stats', [WalletSyncController::class, 'getSyncStats']);

});