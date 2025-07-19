<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\models\WalletTranaction; 
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use DB; 
use App\models\Wallet; 
use App\Services\PesapalService;
use App\Models\PesapalTransaction;

class WalletTranactionController extends Controller
{

    protected $PesapalService; 

    public function __construct(PesapalService $pesapalService)
    {
        $this->pesapalService = $pesapalService;
    }

    public function createTransaction(Request $request)
{

    try {

    $validated = $request->validate([
        'wallet_id' => 'required|integer|exists:Wallets,id',
        'amount' => 'required|integer',
        'phone_number' => 'required|string',
        'name' => 'required|string',
        'description_something_nice' => 'required|string',
        'transaction_type' => ['sometimes', Rule::in(WalletTranaction::TRANSACTION_TYPES)],
        'status' => ['sometimes', Rule::in(WalletTranaction::STATUSES)],
    ]);

    $current_balance = Wallet::where('id',$validated['wallet_id'])->first()->balance; 

    DB::beginTransaction();

    
        $transaction = new WalletTranaction();


        
        // Frontend-provided fields (from validated request)
        $transaction->wallet_id = $validated['wallet_id'];
        $transaction->amount = $validated['amount'];
        $transaction->description = "From {$validated['name']} ({$validated['phone_number']}): {$validated['description_something_nice']}";
        
        // Backend-generated fields
        $transaction->transaction_type = $validated['transaction_type'] ?? 'donation_sent';
        $transaction->status = $validated['status'] ?? 'pending';
        $transaction->reference_id = 'txn_' . Str::uuid();
        $transaction->reference_type = 'payment';
        $transaction->transaction_hash = substr(hash('sha256', $transaction->wallet_id . microtime(true)), 0, 20);
        $transaction->balance_after = $current_balance+$validated['amount']; 
        $transaction->created_at = now();
        
        // Metadata (optional)
        $transaction->metadata = [
            'phone' => $validated['phone_number'],
            'name' => $validated['name'],
            'initiated_at' => now()->toDateTimeString()
        ];
        
        if (!$transaction->save()) {
            throw new \RuntimeException('Failed to save transaction');
        }
        
        DB::commit();

        $orderData = [
            'amount' => $transaction->amount,
            'phone_number' => $transaction->metadata['phone'],
            'unique_id_reference' => $transaction->transaction_hash,
            'description' => 'Luseke Wallet Donation',
            'email' => $transaction->email ?? null,
            'first_name' => $transaction->metadata['name'] ?? 'Donator',
            'wallet_transaction_id_saved'=>$transaction->id
        ];

        // NB: THE "UNIQUE_ID_REFERENCE" WE SEND, IS SENT BACK AS THE "MERCHANT_ID" AND THEY ATTACH A NEW "ORDER_TRACKING_ID" FROM THEIR SIDE .  
        
         $response = $this->pesapalService->submitOrder($orderData);

        if ($response['success']) {
            return response()->json([
                'success' => true,
                'redirect_url' => $response['redirect_url'],
                'order_tracking_id' => $response['order_tracking_id'],
                'merchant_reference' => $response['merchant_reference']
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => $response['message'] ?? 'Payment service error'
            ]);
        }

       


    }  
    catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'wallet_id' => 'sometimes|exists:wallets,id',
            'transaction_type' => ['sometimes', Rule::in(WalletTranaction::TRANSACTION_TYPES)],
            'status' => ['sometimes', Rule::in(WalletTranaction::STATUSES)],
            'per_page' => 'sometimes|integer|min:1|max:100',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
        ]);

        $query = WalletTranaction::with('wallet.user')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('wallet_id')) {
            $query->forWallet($request->wallet_id);
        }

        if ($request->has('transaction_type')) {
            $query->byType($request->transaction_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
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
     * Show a specific payment transaction
     */
    public function show(WalletTranaction $WalletTranaction): JsonResponse
    {
        $WalletTranaction->load(['wallet.user', 'pesapalTransactions']);

        return response()->json([
            'success' => true,
            'data' => $WalletTranaction,
        ]);
    }

    /**
     * Create a new payment transaction (for donations)
     */
    public function createDonation(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_wallet_id' => 'required|exists:wallets,id',
            'amount' => 'required|numeric|min:1|max:10000000',
            'description' => 'sometimes|string|max:500',
            'reference_id' => 'sometimes|string|max:255',
            'reference_type' => 'sometimes|string|max:100',
        ]);

        try {
            DB::beginTransaction();

            $wallet = Wallet::findOrFail($request->recipient_wallet_id);

            // Create pending donation transaction
            $transaction = WalletTranaction::createPending([
                'wallet_id' => $wallet->id,
                'transaction_type' => 'donation_received',
                'amount' => $request->amount,
                'balance_after' => $wallet->balance, // Will be updated when payment completes
                'description' => $request->description ?? "Donation received",
                'reference_id' => $request->reference_id,
                'reference_type' => $request->reference_type ?? 'donation',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Donation transaction created successfully',
                'data' => $transaction->load('wallet.user'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create donation transaction: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create donation transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete a payment transaction
     */
    public function complete(WalletTranaction $WalletTranaction): JsonResponse
    {
        if ($WalletTranaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not in pending status',
            ], 400);
        }

        try {
            DB::beginTransaction();

            $wallet = $WalletTranaction->wallet;
            $newBalance = $wallet->balance + $WalletTranaction->amount;

            // Update wallet balance
            $wallet->update(['balance' => $newBalance]);

            // Mark transaction as completed
            $WalletTranaction->markAsCompleted($newBalance);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaction completed successfully',
                'data' => $WalletTranaction->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete transaction: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to complete transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Fail a payment transaction
     */
    public function fail(WalletTranaction $WalletTranaction, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => 'sometimes|string|max:500',
        ]);

        if ($WalletTranaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not in pending status',
            ], 400);
        }

        try {
            $WalletTranaction->markAsFailed($request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Transaction marked as failed',
                'data' => $WalletTranaction->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark transaction as failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update transaction status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel a payment transaction
     */
    public function cancel(WalletTranaction $WalletTranaction, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => 'sometimes|string|max:500',
        ]);

        if (!in_array($WalletTranaction->status, ['pending', 'failed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction cannot be cancelled',
            ], 400);
        }

        try {
            $WalletTranaction->markAsCancelled($request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Transaction cancelled successfully',
                'data' => $WalletTranaction->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cancel transaction: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel transaction',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get transaction statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $request->validate([
            'wallet_id' => 'sometimes|exists:wallets,id',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date|after_or_equal:from_date',
        ]);

        $query = WalletTranaction::query();

        if ($request->has('wallet_id')) {
            $query->forWallet($request->wallet_id);
        }

        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $stats = [
            'total_transactions' => $query->count(),
            'completed_transactions' => $query->clone()->completed()->count(),
            'pending_transactions' => $query->clone()->pending()->count(),
            'failed_transactions' => $query->clone()->failed()->count(),
            'total_amount' => $query->clone()->completed()->sum('amount'),
            'donations_received' => $query->clone()->completed()->byType('donation_received')->sum('amount'),
            'donations_sent' => $query->clone()->completed()->byType('donation_sent')->sum('amount'),
            'withdrawals' => $query->clone()->completed()->byType('withdrawal')->sum('amount'),
            'deposits' => $query->clone()->completed()->byType('deposit')->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Add metadata to a transaction
     */
    public function addMetadata(WalletTranaction $WalletTranaction, Request $request): JsonResponse
    {
        $request->validate([
            'metadata' => 'required|array',
        ]);

        try {
            $WalletTranaction->addMetadata($request->metadata);

            return response()->json([
                'success' => true,
                'message' => 'Metadata added successfully',
                'data' => $WalletTranaction->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to add metadata: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to add metadata',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get transactions for a specific wallet
     */
    public function getWalletTransactions(Wallet $wallet, Request $request): JsonResponse
    {
        $request->validate([
            'transaction_type' => ['sometimes', Rule::in(WalletTranaction::TRANSACTION_TYPES)],
            'status' => ['sometimes', Rule::in(WalletTranaction::STATUSES)],
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $query = $wallet->WalletTranactions()
            ->orderBy('created_at', 'desc');

        if ($request->has('transaction_type')) {
            $query->byType($request->transaction_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }
}
