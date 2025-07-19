<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\PesapalTransaction;
use App\Models\WalletTranaction;
use App\models\Wallet; 
use App\Services\PesapalService;
use Inertia\Inertia;

class PesapalTransactionController extends Controller
{

    protected $PesapalService; 

    public function __construct(PesapalService $pesapalService)
    {
        $this->pesapalService = $pesapalService;
    }


    /**
     * Handle Pesapal callback (GET and POST)
     */
    public function handleCallback11(Request $request)
    {
        Log::info('Pesapal Callback Received:', [
            'method' => $request->method(),
            'data' => $request->all()
        ]);

        try {
            // Validate required parameters
            $validated = $this->validateCallback($request);
            $orderTrackingId = $validated['OrderTrackingId'];

            // Find the transaction in PesapalTransactions table
            $pesapalTransaction = PesapalTransaction::where('order_tracking_id', $orderTrackingId)->first();

            if (!$pesapalTransaction) {
                Log::error('Pesapal transaction not found', ['order_tracking_id' => $orderTrackingId]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Check payment status using the merchant reference
            $statusResponse = $this->checkPaymentStatus($pesapalTransaction->merchant_reference);

            // Update transaction record
            $this->updateTransaction($pesapalTransaction, $statusResponse);

            return $this->buildResponse($pesapalTransaction, $statusResponse);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in callback', ['errors' => $e->errors()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid request parameters',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Callback processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your payment'
            ], 500);
        }
    }

    public function handleCallback22(Request $request)
{
    Log::info('Pesapal Callback Received:', [
        'method' => $request->method(),
        'data' => $request->all()
    ]);

    try {
        // Validate required parameters
        $validated = $request->validate([
            'OrderTrackingId' => 'required|string',
            'OrderMerchantReference' => 'required|string',
            'OrderNotificationType' => 'nullable|string|in:CALLBACKURL'
        ]);

        // Find the transaction
        $transaction = PesapalTransaction::where([
            'order_tracking_id' => $validated['OrderTrackingId'],
            'merchant_reference' => $validated['OrderMerchantReference']
        ])->firstOrFail();

        // Check payment status
        $statusResponse = $this->pesapalService->checkTransactionStatus(
            $validated['OrderMerchantReference']
        );

        // Update transaction
        $transaction->update([
            'payment_status' => $statusResponse['payment_status_description'],
            'last_status_check_at' => now(),
            'status_check_responses' => array_merge(
                (array)$transaction->status_check_responses,
                [$statusResponse]
            )
        ]);

        // Redirect to appropriate Inertia page
        return $this->handleInertiaResponse($transaction, $statusResponse);

    } catch (ModelNotFoundException $e) {
        return inertia('Payments/CallbackError', [
            'error' => 'Transaction not found',
            'reference' => $request->input('OrderMerchantReference')
        ]);
    } catch (\Exception $e) {
        return inertia('Payments/CallbackError', [
            'error' => 'Payment processing error',
            'message' => $e->getMessage(),
            'reference' => $request->input('OrderMerchantReference')
        ]);
    }
}

protected function handleInertiaResponse($transaction, $statusResponse)
{
    $data = [
        'transaction' => [
            'id' => $transaction->id,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
            'reference' => $transaction->merchant_reference,
            'tracking_id' => $transaction->order_tracking_id,
            'status' => $statusResponse['payment_status_description'],
            'timestamp' => now()->toDateTimeString()
        ]
    ];

    if ($statusResponse['payment_status_description'] === 'COMPLETED') {
        return inertia('Payments/Success', $data);
    }

    return inertia('Payments/Pending', array_merge($data, [
        'check_interval' => 5000 // milliseconds for frontend polling
    ]));
}

    /**
     * Validate callback request
     */
    protected function validateCallback(Request $request)
    {
        return $request->validate([
            'OrderTrackingId' => 'required|string',
            'OrderMerchantReference' => 'nullable|string',
            'OrderNotificationType' => 'nullable|string',
        ]);
    }

    /**
     * Check payment status with Pesapal API
     */
    protected function checkPaymentStatus($merchantReference)
    {
        $result = $this->pesapalService->checkTransactionStatus($merchantReference);

        if (!$result['success']) {
            throw new \Exception("Failed to verify payment status: " . $result['message']);
        }

        return $result['details'];
    }

    /**
     * Update transaction record
     */
    protected function updateTransaction(PesapalTransaction $transaction, array $statusResponse)
    {
        $updateData = [
            'payment_status' => $statusResponse['payment_status_description'],
            'payment_method' => $statusResponse['payment_method'] ?? null,
            'payment_account' => $statusResponse['payment_account'] ?? null,
            'last_status_check_at' => now(),
            'status_check_responses' => array_merge(
                (array)$transaction->status_check_responses,
                [$statusResponse]
            )
        ];

        if ($statusResponse['payment_status_description'] === 'COMPLETED') {
            $updateData['payment_completed_at'] = now();
        }

        $transaction->update($updateData);
    }

    /**
     * Build appropriate response
     */
    protected function buildResponse(PesapalTransaction $transaction, array $statusResponse)
    {
        $baseResponse = [
            'transaction_id' => $transaction->id,
            'merchant_reference' => $transaction->merchant_reference,
            'order_tracking_id' => $transaction->order_tracking_id,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency
        ];

        if ($statusResponse['payment_status_description'] === 'COMPLETED') {
            return response()->json(array_merge($baseResponse, [
                'status' => 'success',
                'message' => 'Payment completed successfully',
                'confirmation_code' => $statusResponse['confirmation_code'] ?? null,
                'completed_at' => now()->toDateTimeString()
            ]));
        }

        return response()->json(array_merge($baseResponse, [
            'status' => strtolower($statusResponse['payment_status_description']),
            'message' => 'Payment is being processed',
            'current_status' => $statusResponse['payment_status_description']
        ]));
    }




    public function handleCallbackImp(Request $request)
{
    try {
        // Validate callback parameters
        $validated = $request->validate([
            'OrderTrackingId' => 'required|string',
            'OrderMerchantReference' => 'required|string'
        ]);

        // Find transaction
        $transaction = PesapalTransaction::where([
            'order_tracking_id' => $validated['OrderTrackingId'],
            'merchant_reference' => $validated['OrderMerchantReference']
        ])->first();

        if (!$transaction) {
            return inertia('PublicPages/PaymentCallbackHandler', [
                'status' => 'error',
                'message' => 'Transaction not found'
            ]);
        }

        // Get current status - use OrderTrackingId instead of merchant reference
        $statusResponse = $this->pesapalService->checkTransactionStatus(
            $validated['OrderTrackingId']  // Changed from OrderMerchantReference to OrderTrackingId
        );

        // Check if the API call was successful
        if (!$statusResponse['success']) {
            return inertia('PublicPages/PaymentCallbackHandler', [
                'status' => 'error',
                'message' => $statusResponse['message'] ?? 'Failed to check payment status'
            ]);
        }

        // Extract the actual status from the response details
        $paymentDetails = $statusResponse['details'];
        $paymentStatus = $paymentDetails['payment_status_description'] ?? 'Unknown';

        // Update transaction status in database if needed
        // $transaction->update([
        //     'status' => $paymentStatus,
        //     'confirmation_code' => $paymentDetails['confirmation_code'] ?? null,
        //     'payment_method' => $paymentDetails['payment_method'] ?? null,
        //     'updated_at' => now()
        // ]);

        // Prepare response data
        $data = [
            'status' => strtolower($paymentStatus), // Convert to lowercase for consistency
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
            'reference' => $transaction->merchant_reference,
            'tracking_id' => $transaction->order_tracking_id,
            'confirmation_code' => $paymentDetails['confirmation_code'] ?? null,
            'payment_method' => $paymentDetails['payment_method'] ?? null,
            'timestamp' => now()->toDateTimeString(),
            'message' => $paymentDetails['message'] ?? 'Payment processed'
        ];

        return inertia('PublicPages/PaymentCallbackHandler', $data);

    } catch (\Exception $e) {
        return inertia('PublicPages/PaymentCallbackHandler', [
            'status' => 'error',
            'message' => 'An error occurred: ' . $e->getMessage()
        ]);
    }
}


public function handleCallback(Request $request)
{
    try {
        // Validate callback parameters
        $validated = $request->validate([
            'OrderTrackingId' => 'required|string',
            'OrderMerchantReference' => 'required|string'
        ]);

        // Find transaction
        $transaction = PesapalTransaction::where([
            'order_tracking_id' => $validated['OrderTrackingId'],
            'merchant_reference' => $validated['OrderMerchantReference']
        ])->first();

        if (!$transaction) {
            return inertia('PublicPages/PaymentCallbackHandler', [
                'status' => 'error',
                'message' => 'Transaction not found'
            ]);
        }

        // Get current status - use OrderTrackingId instead of merchant reference
        $statusResponse = $this->pesapalService->checkTransactionStatus(
            $validated['OrderTrackingId']  // Changed from OrderMerchantReference to OrderTrackingId
        );

        // Check if the API call was successful
        if (!$statusResponse['success']) {
            return inertia('PublicPages/PaymentCallbackHandler', [
                'status' => 'error',
                'message' => $statusResponse['message'] ?? 'Failed to check payment status'
            ]);
        }

        // Extract the actual status from the response
        $paymentDetails = $statusResponse['details'];
        $paymentStatus = $statusResponse['status']; // Use the processed status from service

        // Map status for database storage
        $dbStatus = $this->mapPaymentStatusForDatabase($paymentStatus);
        
        // Update transaction status in database
        $transaction->update([
            'status' => $dbStatus,
            'confirmation_code' => $paymentDetails['confirmation_code'] ?? null,
            'payment_method' => $paymentDetails['payment_method'] ?? null,
            'updated_at' => now()
        ]);

        // Prepare response data with appropriate status for frontend
        $data = [
            'status' => strtolower($this->mapPaymentStatusForFrontend($paymentStatus)),
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
            'reference' => $transaction->merchant_reference,
            'tracking_id' => $transaction->order_tracking_id,
            'confirmation_code' => $paymentDetails['confirmation_code'] ?? null,
            'payment_method' => $paymentDetails['payment_method'] ?? null,
            'timestamp' => now()->toDateTimeString(),
            'message' => $this->getStatusMessage($paymentStatus),
            'raw_status' => $paymentStatus // Include original status for debugging
        ];

        return inertia('PublicPages/PaymentCallbackHandler', $data);

    } catch (\Exception $e) {
        return inertia('PublicPages/PaymentCallbackHandler', [
            'status' => 'error',
            'message' => 'An error occurred: ' . $e->getMessage()
        ]);
    }
}

/**
 * Map payment status for database storage
 */
private function mapPaymentStatusForDatabase($status)
{
    $statusMap = [
        'Completed' => 'completed',
        'Pending' => 'pending',
        'Pending Payment' => 'pending',
        'INVALID' => 'pending',
        'Failed' => 'failed',
        'Cancelled' => 'cancelled'
    ];

    return $statusMap[$status] ?? 'unknown';
}

/**
 * Map payment status for frontend display
 */
private function mapPaymentStatusForFrontend($status)
{
    $statusMap = [
        'Completed' => 'success',
        'Pending' => 'pending',
        'Pending Payment' => 'pending',
        'INVALID' => 'pending',
        'Failed' => 'failed',
        'Cancelled' => 'cancelled'
    ];

    return $statusMap[$status] ?? 'unknown';
}

/**
 * Get user-friendly status message
 */
private function getStatusMessage($status)
{
    $messages = [
        'Completed' => 'Payment completed successfully',
        'Pending' => 'Payment is still pending',
        'Pending Payment' => 'Payment is still pending',
        'INVALID' => 'Payment is still being processed',
        'Failed' => 'Payment failed',
        'Cancelled' => 'Payment was cancelled'
    ];

    return $messages[$status] ?? 'Payment status unknown';
}

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
