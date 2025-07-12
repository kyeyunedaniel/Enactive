<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PesapalTransaction extends Model
{

    use HasFactory;

    protected $fillable = [
        'wallet_transaction_id',
        'merchant_reference',
        'order_tracking_id',
        'amount',
        'currency',
        'description',
        'payment_status',
        'payment_method',
        'payment_account',
        'redirect_url',
        'notification_id',
        'ipn_data',
        'submit_order_request',
        'submit_order_response',
        'status_check_responses',
        'error_message',
        'error_code',
        'submitted_at',
        'payment_completed_at',
        'last_status_check_at',
        'ipn_received_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'ipn_data' => 'array',
        'submit_order_request' => 'array',
        'submit_order_response' => 'array',
        'status_check_responses' => 'array',
        'submitted_at' => 'datetime',
        'payment_completed_at' => 'datetime',
        'last_status_check_at' => 'datetime',
        'ipn_received_at' => 'datetime',
    ];

    // Constants for payment status
    const STATUS_PENDING = 'PENDING';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_FAILED = 'FAILED';
    const STATUS_INVALID = 'INVALID';

    const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_COMPLETED,
        self::STATUS_FAILED,
        self::STATUS_INVALID,
    ];

    // Relationships
    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'wallet_transaction_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('payment_status', self::STATUS_PENDING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('payment_status', self::STATUS_COMPLETED);
    }

    public function scopeFailed($query)
    {
        return $query->where('payment_status', self::STATUS_FAILED);
    }

    public function scopeInvalid($query)
    {
        return $query->where('payment_status', self::STATUS_INVALID);
    }

    public function scopeByMerchantReference($query, $reference)
    {
        return $query->where('merchant_reference', $reference);
    }

    public function scopeByOrderTrackingId($query, $trackingId)
    {
        return $query->where('order_tracking_id', $trackingId);
    }

    // Accessors
    public function getIsPendingAttribute(): bool
    {
        return $this->payment_status === self::STATUS_PENDING;
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->payment_status === self::STATUS_COMPLETED;
    }

    public function getIsFailedAttribute(): bool
    {
        return $this->payment_status === self::STATUS_FAILED;
    }

    public function getIsInvalidAttribute(): bool
    {
        return $this->payment_status === self::STATUS_INVALID;
    }

    public function getFormattedAmountAttribute(): string
    {
        return $this->currency . ' ' . number_format($this->amount, 2);
    }

    // Helper methods
    public function markAsSubmitted(array $submitOrderResponse = []): self
    {
        $this->update([
            'submit_order_response' => $submitOrderResponse,
            'submitted_at' => now(),
        ]);

        return $this;
    }

    public function markAsCompleted(array $completionData = []): self
    {
        $this->update([
            'payment_status' => self::STATUS_COMPLETED,
            'payment_completed_at' => now(),
            'ipn_data' => $completionData,
        ]);

        return $this;
    }

    public function markAsFailed(string $errorMessage = null, string $errorCode = null): self
    {
        $this->update([
            'payment_status' => self::STATUS_FAILED,
            'error_message' => $errorMessage,
            'error_code' => $errorCode,
            'last_status_check_at' => now(),
        ]);

        return $this;
    }

    public function markAsInvalid(string $errorMessage = null): self
    {
        $this->update([
            'payment_status' => self::STATUS_INVALID,
            'error_message' => $errorMessage,
            'last_status_check_at' => now(),
        ]);

        return $this;
    }

    public function updateOrderTrackingId(string $trackingId): self
    {
        $this->update([
            'order_tracking_id' => $trackingId,
        ]);

        return $this;
    }

    public function updateRedirectUrl(string $redirectUrl): self
    {
        $this->update([
            'redirect_url' => $redirectUrl,
        ]);

        return $this;
    }

    public function recordStatusCheck(array $statusResponse): self
    {
        $statusChecks = $this->status_check_responses ?? [];
        $statusChecks[] = [
            'timestamp' => now()->toISOString(),
            'response' => $statusResponse,
        ];

        $this->update([
            'status_check_responses' => $statusChecks,
            'last_status_check_at' => now(),
        ]);

        return $this;
    }

    public function recordIpnNotification(array $ipnData): self
    {
        $this->update([
            'ipn_data' => $ipnData,
            'ipn_received_at' => now(),
        ]);

        return $this;
    }

    public function updatePaymentDetails(string $method = null, string $account = null): self
    {
        $updates = [];
        
        if ($method) {
            $updates['payment_method'] = $method;
        }
        
        if ($account) {
            $updates['payment_account'] = $account;
        }

        if (!empty($updates)) {
            $this->update($updates);
        }

        return $this;
    }

    // Static helper methods
    public static function generateMerchantReference(int $walletTransactionId): string
    {
        return 'TXN_' . $walletTransactionId . '_' . Str::random(8);
    }

    public static function createForPayment(PaymentTransaction $paymentTransaction, array $additionalData = []): self
    {
        $data = array_merge([
            'wallet_transaction_id' => $paymentTransaction->id,
            'merchant_reference' => self::generateMerchantReference($paymentTransaction->id),
            'amount' => $paymentTransaction->amount,
            'currency' => 'UGX',
            'description' => $paymentTransaction->description ?? 'Payment transaction',
            'payment_status' => self::STATUS_PENDING,
        ], $additionalData);

        return self::create($data);
    }

    public static function findByMerchantReference(string $reference): ?self
    {
        return self::where('merchant_reference', $reference)->first();
    }

    public static function findByOrderTrackingId(string $trackingId): ?self
    {
        return self::where('order_tracking_id', $trackingId)->first();
    }

    // Get last status check response
    public function getLastStatusCheckResponse(): ?array
    {
        if (empty($this->status_check_responses)) {
            return null;
        }

        return end($this->status_check_responses);
    }

    // Check if transaction needs status update
    public function needsStatusCheck(): bool
    {
        if (!$this->is_pending) {
            return false;
        }

        // Check if it's been more than 5 minutes since last check
        if (!$this->last_status_check_at) {
            return true;
        }

        return $this->last_status_check_at->diffInMinutes(now()) >= 5;
    }
}
