<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\WalletTranaction;
use App\Models\PesapalTransaction;
use App\Models\Wallet;
use App\Services\PesapalService;
use Carbon\Carbon;

class WalletSyncController extends Controller
{
    protected $pesapalService;

    public function __construct(PesapalService $pesapalService)
    {
        $this->pesapalService = $pesapalService;
    }

    /**
     * Synchronize all pending wallet transactions with Pesapal
     * This endpoint checks all pending transactions and updates wallet balances
     */
    public function syncAllPendingTransactions(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'wallet_id' => 'sometimes|exists:wallets,id',
            'max_transactions' => 'sometimes|integer|min:1|max:100',
            'dry_run' => 'sometimes|boolean'
        ]);

        $dryRun = $request->boolean('dry_run', false);
        $maxTransactions = $request->get('max_transactions', 100);
        
        $results = [
            'total_checked' => 0,
            'updated_transactions' => 0,
            'completed_transactions' => 0,
            'failed_transactions' => 0,
            'wallets_updated' => 0,
            'errors' => [],
            'processed_transactions' => [],
            'dry_run' => $dryRun
        ];

        try {
            // Get pending wallet transactions
            $query = WalletTranaction::where('status', 'pending')
                ->with(['wallet', 'pesapalTransactions'])
                ->orderBy('created_at', 'asc');

            if ($request->has('user_id')) {
                $query->whereHas('wallet', function($q) use ($request) {
                    $q->where('user_id', $request->user_id);
                });
            }

            if ($request->has('wallet_id')) {
                $query->where('wallet_id', $request->wallet_id);
            }

            $pendingTransactions = $query->limit($maxTransactions)->get();
            $results['total_checked'] = $pendingTransactions->count();

            Log::info("Starting wallet sync process", [
                'total_transactions' => $results['total_checked'],
                'dry_run' => $dryRun,
                'filters' => $request->only(['user_id', 'wallet_id'])
            ]);

            foreach ($pendingTransactions as $walletTransaction) {
                $transactionResult = $this->processSingleTransaction($walletTransaction, $dryRun);
                
                $results['processed_transactions'][] = $transactionResult;
                
                if ($transactionResult['status'] === 'completed') {
                    $results['completed_transactions']++;
                    if ($transactionResult['wallet_updated'] ?? false) {
                        $results['wallets_updated']++;
                    }
                } elseif ($transactionResult['status'] === 'failed') {
                    $results['failed_transactions']++;
                }
                
                if ($transactionResult['updated']) {
                    $results['updated_transactions']++;
                }
                
                if (!empty($transactionResult['errors'])) {
                    $results['errors'] = array_merge($results['errors'], $transactionResult['errors']);
                }
            }

            return response()->json([
                'success' => true,
                'message' => $dryRun 
                    ? "Dry run completed. {$results['total_checked']} transactions would be processed."
                    : "Sync completed successfully. {$results['updated_transactions']} transactions updated.",
                'data' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Wallet sync failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Wallet sync failed: ' . $e->getMessage(),
                'data' => $results
            ], 500);
        }
    }

    /**
     * Process a single wallet transaction
     */
    protected function processSingleTransaction(WalletTranaction $walletTransaction, bool $dryRun = false): array
    {
        $result = [
            'transaction_id' => $walletTransaction->id,
            'wallet_id' => $walletTransaction->wallet_id,
            'amount' => $walletTransaction->amount,
            'status' => 'pending',
            'updated' => false,
            'wallet_updated' => false,
            'errors' => [],
            'pesapal_status' => null,
            'order_tracking_id' => null
        ];

        try {
            // Find associated Pesapal transaction
            $pesapalTransaction = $walletTransaction->pesapalTransactions()->first();
            
            if (!$pesapalTransaction) {
                $result['errors'][] = "No Pesapal transaction found for wallet transaction {$walletTransaction->id}";
                return $result;
            }

            $result['order_tracking_id'] = $pesapalTransaction->order_tracking_id;

            // Check payment status with Pesapal
            $statusResponse = $this->pesapalService->checkTransactionStatus($pesapalTransaction->order_tracking_id);

            if (!$statusResponse['success']) {
                $result['errors'][] = "Failed to check Pesapal status: " . ($statusResponse['message'] ?? 'Unknown error');
                return $result;
            }

            $pesapalStatus = $statusResponse['status'];
            $result['pesapal_status'] = $pesapalStatus;

            // Update based on Pesapal status
            if ($pesapalStatus === 'Completed') {
                $result = $this->handleCompletedTransaction($walletTransaction, $pesapalTransaction, $statusResponse, $result, $dryRun);
            } elseif (in_array($pesapalStatus, ['Failed', 'Cancelled', 'INVALID'])) {
                $result = $this->handleFailedTransaction($walletTransaction, $pesapalTransaction, $pesapalStatus, $result, $dryRun);
            } else {
                // Still pending - just update the last check time
                if (!$dryRun) {
                    $pesapalTransaction->update(['last_status_check_at' => now()]);
                }
                $result['status'] = 'still_pending';
            }

        } catch (\Exception $e) {
            Log::error("Error processing transaction {$walletTransaction->id}", [
                'error' => $e->getMessage(),
                'wallet_transaction_id' => $walletTransaction->id
            ]);
            
            $result['errors'][] = "Processing error: " . $e->getMessage();
        }

        return $result;
    }

    /**
     * Handle completed transaction
     */
    protected function handleCompletedTransaction(
        WalletTranaction $walletTransaction, 
        PesapalTransaction $pesapalTransaction, 
        array $statusResponse, 
        array $result, 
        bool $dryRun = false
    ): array {
        try {
            if (!$dryRun) {
                DB::beginTransaction();

                // Update Pesapal transaction
                $pesapalTransaction->update([
                    'payment_status' => 'COMPLETED',
                    'payment_completed_at' => now(),
                    'last_status_check_at' => now(),
                    'status_check_responses' => array_merge(
                        (array)$pesapalTransaction->status_check_responses ?? [],
                        [$statusResponse]
                    )
                ]);

                // Update wallet balance
                $wallet = $walletTransaction->wallet;
                $newBalance = $wallet->balance + $walletTransaction->amount;
                $wallet->update(['balance' => $newBalance]);

                // Mark wallet transaction as completed
                $walletTransaction->markAsCompleted($newBalance);

                DB::commit();
            }

            $result['status'] = 'completed';
            $result['updated'] = true;
            $result['wallet_updated'] = true;
            $result['new_balance'] = $dryRun ? 
                ($walletTransaction->wallet->balance + $walletTransaction->amount) : 
                $walletTransaction->wallet->fresh()->balance;

        } catch (\Exception $e) {
            if (!$dryRun) {
                DB::rollBack();
            }
            
            $result['errors'][] = "Failed to complete transaction: " . $e->getMessage();
            Log::error("Failed to complete wallet transaction {$walletTransaction->id}", [
                'error' => $e->getMessage()
            ]);
        }

        return $result;
    }

    /**
     * Handle failed transaction
     */
    protected function handleFailedTransaction(
        WalletTranaction $walletTransaction, 
        PesapalTransaction $pesapalTransaction, 
        string $pesapalStatus, 
        array $result, 
        bool $dryRun = false
    ): array {
        try {
            if (!$dryRun) {
                DB::beginTransaction();

                // Update Pesapal transaction
                $pesapalTransaction->update([
                    'payment_status' => 'FAILED',
                    'last_status_check_at' => now(),
                    'error_message' => "Payment {$pesapalStatus} via Pesapal"
                ]);

                // Mark wallet transaction as failed
                $walletTransaction->markAsFailed("Payment {$pesapalStatus} via Pesapal");

                DB::commit();
            }

            $result['status'] = 'failed';
            $result['updated'] = true;

        } catch (\Exception $e) {
            if (!$dryRun) {
                DB::rollBack();
            }
            
            $result['errors'][] = "Failed to mark transaction as failed: " . $e->getMessage();
            Log::error("Failed to fail wallet transaction {$walletTransaction->id}", [
                'error' => $e->getMessage()
            ]);
        }

        return $result;
    }

    /**
     * Sync transactions for a specific user
     */
    public function syncUserTransactions(Request $request, int $userId): JsonResponse
    {
        $request->merge(['user_id' => $userId]);
        return $this->syncAllPendingTransactions($request);
    }

    /**
     * Sync transactions for a specific wallet
     */
    public function syncWalletTransactions(Request $request, int $walletId): JsonResponse
    {
        $request->merge(['wallet_id' => $walletId]);
        return $this->syncAllPendingTransactions($request);
    }

    /**
     * Get sync statistics
     */
    public function getSyncStats(): JsonResponse
    {
        $stats = [
            'pending_wallet_transactions' => WalletTranaction::where('status', 'pending')->count(),
            'pending_pesapal_transactions' => PesapalTransaction::where('payment_status', 'PENDING')->count(),
            'transactions_needing_check' => WalletTranaction::where('status', 'pending')
                ->whereHas('pesapalTransactions', function($q) {
                    $q->where('payment_status', 'PENDING')
                      ->where(function($subQ) {
                          $subQ->whereNull('last_status_check_at')
                               ->orWhere('last_status_check_at', '<=', Carbon::now()->subMinutes(5));
                      });
                })->count(),
            'oldest_pending_transaction' => WalletTranaction::where('status', 'pending')
                ->orderBy('created_at', 'asc')
                ->first()?->created_at,
            'wallets_with_pending_transactions' => WalletTranaction::where('status', 'pending')
                ->distinct('wallet_id')
                ->count('wallet_id')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Force sync a specific transaction by ID
     */
    public function syncSpecificTransaction(Request $request, int $transactionId): JsonResponse
    {
        $request->validate([
            'dry_run' => 'sometimes|boolean'
        ]);

        $dryRun = $request->boolean('dry_run', false);

        try {
            $walletTransaction = WalletTranaction::with(['wallet', 'pesapalTransactions'])
                ->findOrFail($transactionId);

            if ($walletTransaction->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => "Transaction {$transactionId} is not pending (status: {$walletTransaction->status})"
                ], 400);
            }

            $result = $this->processSingleTransaction($walletTransaction, $dryRun);

            return response()->json([
                'success' => true,
                'message' => $dryRun 
                    ? "Dry run completed for transaction {$transactionId}"
                    : "Transaction {$transactionId} processed successfully",
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to sync specific transaction {$transactionId}", [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => "Failed to sync transaction: " . $e->getMessage()
            ], 500);
        }
    }
}