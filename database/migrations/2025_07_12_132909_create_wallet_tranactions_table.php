<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wallet_tranactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->onDelete('cascade');
            $table->string('transaction_hash')->nullable()->comment('Unique hash for idempotency');
            $table->enum('transaction_type', [
                'deposit',
                'withdrawal', 
                'donation_sent',
                'donation_received',
                'fee',
                'refund',
                'bonus',
                'penalty'
            ]);
            $table->decimal('amount', 15, 2)->comment('Transaction amount in UGX (positive for credit, negative for debit)');
            $table->decimal('balance_after', 15, 2)->comment('Wallet balance after this transaction in UGX');
            $table->text('description')->nullable();
            $table->string('reference_id')->nullable()->comment('Reference to related record (donation_id, withdrawal_id, etc.)');
            $table->string('reference_type')->nullable()->comment('Type of reference (donation, withdrawal, etc.)');
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->json('metadata')->nullable()->comment('Additional transaction data (payment gateway response, etc.)');
            
            $table->timestamp('processed_at')->nullable()->comment('When transaction was actually processed');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['wallet_id', 'transaction_type']);
            $table->index(['wallet_id', 'created_at']);
            $table->index(['transaction_type', 'status']);
            $table->index(['reference_id', 'reference_type']);
            $table->index('transaction_hash');
            $table->index('processed_at');
            
            // Unique constraint for idempotency
            $table->unique(['wallet_id', 'transaction_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_tranactions');
    }
};
