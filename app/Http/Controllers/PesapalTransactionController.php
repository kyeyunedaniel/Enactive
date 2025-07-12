<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\PesapalTransaction;
use App\Models\WalletTranaction;

class PesapalTransactionController extends Controller
{
    //
    /**
     * Display a listing of Pesapal transactions
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'payment_status' => ['sometimes', Rule::in(PesapalTransaction::STATUSES)],
            'merchant_reference' => 'sometimes|string',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
        ]);

        $query = PesapalTransaction::with('WalletTranaction.wallet.user')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->has('merchant_reference')) {
            $query->where('merchant_reference', 'like', '%' . $request->merchant_reference . '%');
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $transactions = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Show a specific Pesapal transaction
     */
    public function show(PesapalTransaction $pesapalTransaction): JsonResponse
    {
        $pesapalTransaction->load('WalletTranaction.wallet.user');

        return response()->json([
            'success' => true,
            'data' => $pesapalTransaction,
        ]);
    }

    /**
     * Create a new Pesapal transaction for a payment
     */
    public function createForPayment(Request $request): JsonResponse
    {
        $request->validate([
            'wallet_transaction_id' => 'required|exists:wallet_transactions,id',
            'description' => 'sometimes|string|max:500',
            'currency' => 'sometimes|string|size:3',
        ]);

        try {
            DB::beginTransaction();

            $WalletTranaction = WalletTranaction::findOrFail($request->wallet_transaction_id);

            // Check if Pesapal transaction already exists
            if ($WalletTranaction->pesapalTransactions()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pesapal transaction already exists for this payment',
                ], 400);
            }

            $pesapalTransaction = PesapalTransaction::createForPayment($WalletTranaction, [
                'description' => $request->description,
                'currency' => $request->currency ?? 'UGX',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesapal transaction created successfully',
                'data' => $pesapalTransaction->load('WalletTranaction'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create Pesapal transaction: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create Pesapal transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update order tracking ID after submitting to Pesapal
     */
    public function updateOrderTrackingId(PesapalTransaction $pesapalTransaction, Request $request): JsonResponse
    {
        $request->validate([
            'order_tracking_id' => 'required|string|unique:pesapal_transactions,order_tracking_id,' . $pesapalTransaction->id,
            'redirect_url' => 'sometimes|url',
            'submit_order_response' => 'sometimes|array',
        ]);

        try {
            $pesapalTransaction->updateOrderTrackingId($request->order_tracking_id);

            if ($request->has('redirect_url')) {
                $pesapalTransaction->updateRedirectUrl($request->redirect_url);
            }

            if ($request->has('submit_order_response')) {
                $pesapalTransaction->update([
                    'submit_order_response' => $request->submit_order_response,
                ]);
            }

            $pesapalTransaction->markAsSubmitted($request->submit_order_response ?? []);

            return response()->json([
                'success' => true,
                'message' => 'Order tracking ID updated successfully',
                'data' => $pesapalTransaction->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update order tracking ID: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update order tracking ID',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update payment status based on Pesapal response
     */
    public function updatePaymentStatus(PesapalTransaction $pesapalTransaction, Request $request): JsonResponse
    {
        $request->validate([
            'payment_status' => ['required', Rule::in(PesapalTransaction::STATUSES)],
            'payment_method' => 'sometimes|string',
            'payment_account' => 'sometimes|string',
            'status_response' => 'sometimes|array',
            'error_message' => 'sometimes|string',
            'error_code' => 'sometimes|string',
        ]);

        try {
            DB::beginTransaction();

            $oldStatus = $pesapalTransaction->payment_status;
            $newStatus = $request->payment_status;

            // Record status check
            if ($request->has('status_response')) {
                $pesapalTransaction->recordStatusCheck($request->status_response);
            }

            // Update payment details if provided
            if ($request->has('payment_method') || $request->has('payment_account')) {
                $pesapalTransaction->updatePaymentDetails(
                    $request->payment_method,
                    $request->payment_account
                );
            }

            // Update status based on new status
            switch ($newStatus) {
                case PesapalTransaction::STATUS_COMPLETED:
                    $pesapalTransaction->markAsCompleted($request->status_response ?? []);
                    
                    // Complete the associated payment transaction
                    $WalletTranaction = $pesapalTransaction->WalletTranaction;
                    if ($WalletTranaction->status === 'pending') {
                        $wallet = $WalletTranaction->wallet;
                        $newBalance = $wallet->balance + $WalletTranaction->amount;
                        $wallet->update(['balance' => $newBalance]);
                        $WalletTranaction->markAsCompleted($newBalance);
                    }
                    break;

                case PesapalTransaction::STATUS_FAILED:
                    $pesapalTransaction->markAsFailed($request->error_message, $request->error_code);
                    
                    // Mark payment transaction as failed
                    $WalletTranaction = $pesapalTransaction->WalletTranaction;
                    if ($WalletTranaction->status === 'pending') {
                        $WalletTranaction->markAsFailed($request->error_message);
                    }
                    break;

                case PesapalTransaction::STATUS_INVALID:
                    $pesapalTransaction->markAsInvalid($request->error_message);
                    
                    // Mark payment transaction as failed
                    $WalletTranaction = $pesapalTransaction->WalletTranaction;
                    if ($WalletTranaction->status === 'pending') {
                        $WalletTranaction->markAsFailed($request->error_message);
                    }
                    break;

                default:
                    $pesapalTransaction->update(['payment_status' => $newStatus]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Payment status updated from {$oldStatus} to {$newStatus}",
                'data' => $pesapalTransaction->fresh(['WalletTranaction']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update payment status: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle IPN notification from Pesapal
     */
    public function handleIpn(Request $request): JsonResponse
    {
        $request->validate([
            'OrderTrackingId' => 'required|string',
            'OrderNotificationType' => 'required|string',
            'OrderMerchantReference' => 'required|string',
        ]);

        try {
            $pesapalTransaction = PesapalTransaction::findByOrderTrackingId($request->OrderTrackingId);

            if (!$pesapalTransaction) {
                Log::warning('IPN received for unknown transaction: ' . $request->OrderTrackingId);
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found',
                ], 404);
            }

            // Record IPN notification
            $pesapalTransaction->recordIpnNotification($request->all());

            // Here you would typically check the transaction status with Pesapal
            // and update accordingly
            Log::info('IPN notification received for transaction: ' . $request->OrderTrackingId);

            return response()->json([
                'success' => true,
                'message' => 'IPN notification processed',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process IPN notification: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to process IPN notification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get transactions that need status check
     */
    public function getPendingStatusChecks(): JsonResponse
    {
        $transactions = PesapalTransaction::pending()
            ->with('WalletTranaction')
            ->get()
            ->filter(function ($transaction) {
                return $transaction->needsStatusCheck();
            });

        return response()->json([
            'success' => true,
            'data' => $transactions->values(),
        ]);
    }

    /**
     * Get transaction by merchant reference
     */
    public function getByMerchantReference(string $merchantReference): JsonResponse
    {
        $transaction = PesapalTransaction::byMerchantReference($merchantReference)
            ->with('WalletTranaction.wallet.user')
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transaction,
        ]);
    }

    /**
     * Get transaction by order tracking ID
     */
    public function getByOrderTrackingId(string $orderTrackingId): JsonResponse
    {
        $transaction = PesapalTransaction::byOrderTrackingId($orderTrackingId)
            ->with('WalletTranaction.wallet.user')
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transaction,
        ]);
    }

    /**
     * Get Pesapal transaction statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $request->validate([
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
        ]);

        $query = PesapalTransaction::query();

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $stats = [
            'total_transactions' => $query->count(),
            'pending_transactions' => $query->clone()->pending()->count(),
            'completed_transactions' => $query->clone()->completed()->count(),
            'failed_transactions' => $query->clone()->failed()->count(),
            'invalid_transactions' => $query->clone()->invalid()->count(),
            'total_amount' => $query->clone()->completed()->sum('amount'),
            'pending_amount' => $query->clone()->pending()->sum('amount'),
            'completed_amount' => $query->clone()->completed()->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
