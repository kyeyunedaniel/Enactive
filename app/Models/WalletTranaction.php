<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WalletTranaction extends Model
{
    use HasFactory;
    protected $table = 'wallet_transactions';

    protected $fillable = [
        'wallet_id',
        'transaction_type',
        'amount',
        'balance_after',
        'description',
        'reference_id',
        'reference_type',
        'status',
        'metadata',
        'transaction_hash',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Define the enum values as constants
    const TRANSACTION_TYPES = [
        'deposit',
        'withdrawal',
        'donation_sent',
        'donation_received',
        'fee',
        'refund',
        'bonus',
        'penalty'
    ];

    const STATUSES = [
        'pending',
        'completed',
        'failed',
        'cancelled'
    ];

    // Relationships
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function pesapalTransactions(): HasMany
    {
        return $this->hasMany(PesapalTransaction::class, 'wallet_transaction_id');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    public function scopeForWallet($query, $walletId)
    {
        return $query->where('wallet_id', $walletId);
    }

    // Accessors & Mutators
    public function getIsCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getIsPendingAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsFailedAttribute(): bool
    {
        return $this->status === 'failed';
    }

    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'UGX ' . number_format($this->amount, 2);
    }

    public function getFormattedBalanceAfterAttribute(): string
    {
        return 'UGX ' . number_format($this->balance_after, 2);
    }

    // Helper methods
    public function markAsCompleted(float $balanceAfter): self
    {
        $this->update([
            'status' => 'completed',
            'balance_after' => $balanceAfter,
            'processed_at' => now(),
        ]);

        return $this;
    }

    public function markAsFailed(string $reason = null): self
    {
        $metadata = $this->metadata ?? [];
        if ($reason) {
            $metadata['failure_reason'] = $reason;
        }

        $this->update([
            'status' => 'failed',
            'metadata' => $metadata,
            'processed_at' => now(),
        ]);

        return $this;
    }

    public function markAsCancelled(string $reason = null): self
    {
        $metadata = $this->metadata ?? [];
        if ($reason) {
            $metadata['cancellation_reason'] = $reason;
        }

        $this->update([
            'status' => 'cancelled',
            'metadata' => $metadata,
            'processed_at' => now(),
        ]);

        return $this;
    }

    public function addMetadata(array $data): self
    {
        $metadata = $this->metadata ?? [];
        $this->update([
            'metadata' => array_merge($metadata, $data),
        ]);

        return $this;
    }

    public function getMetadata(string $key = null, $default = null)
    {
        if ($key === null) {
            return $this->metadata ?? [];
        }

        return $this->metadata[$key] ?? $default;
    }

    // Static helper methods
    public static function generateTransactionHash(int $walletId, string $reference = null): string
    {
        $data = $walletId . '_' . ($reference ?? uniqid()) . '_' . microtime(true);
        return hash('sha256', $data);
    }

    public static function createPending(array $data): self
    {
        $data['status'] = 'pending';
        $data['transaction_hash'] = $data['transaction_hash'] ?? self::generateTransactionHash($data['wallet_id'], $data['reference_id'] ?? null);
        
        return self::create($data);
    }
}
