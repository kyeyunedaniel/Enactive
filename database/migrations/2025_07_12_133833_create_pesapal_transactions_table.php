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
        Schema::create('pesapal_transactions', function (Blueprint $table) {
            $table->id();
            
            // Link to your wallet transaction
            $table->foreignId('wallet_transaction_id')->constrained('wallet_transactions')->onDelete('cascade');
            
            // Your system's unique order ID (sent to Pesapal)
            $table->string('merchant_reference')->unique()->comment('Your unique order ID');
            
            // Pesapal's tracking ID (returned from SubmitOrderRequest)
            $table->string('order_tracking_id')->unique()->nullable()->comment('Pesapal tracking ID');
            
            // Payment request details
            $table->decimal('amount', 15, 2)->comment('Amount in UGX');
            $table->string('currency', 3)->default('UGX');
            $table->string('description')->nullable();
            
            // Transaction status from Pesapal (PENDING, COMPLETED, FAILED, INVALID)
            $table->enum('payment_status', ['PENDING', 'COMPLETED', 'FAILED', 'INVALID'])->default('PENDING');
            
            // Payment method used (Mobile Money, Card, etc.)
            $table->string('payment_method')->nullable();
            
            // Payment account (phone number for mobile money, card details, etc.)
            $table->string('payment_account')->nullable();
            
            // Pesapal redirect URL (where customer goes to pay)
            $table->text('redirect_url')->nullable();
            
            // IPN notification details
            $table->string('notification_id')->nullable()->comment('IPN notification ID');
            $table->json('ipn_data')->nullable()->comment('Raw IPN notification data');
            
            // API interaction logs
            $table->json('submit_order_request')->nullable()->comment('Original request sent to Pesapal');
            $table->json('submit_order_response')->nullable()->comment('Response from SubmitOrderRequest');
            $table->json('status_check_responses')->nullable()->comment('Array of status check responses');
            
            // Error handling
            $table->text('error_message')->nullable();
            $table->string('error_code')->nullable();
            
            // Timestamps for tracking
            $table->timestamp('submitted_at')->nullable()->comment('When order was submitted to Pesapal');
            $table->timestamp('payment_completed_at')->nullable()->comment('When payment was completed');
            $table->timestamp('last_status_check_at')->nullable()->comment('Last time we checked status');
            $table->timestamp('ipn_received_at')->nullable()->comment('When IPN notification was received');
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index('merchant_reference');
            $table->index('order_tracking_id');
            $table->index('payment_status');
            $table->index('wallet_transaction_id');
            $table->index(['payment_status', 'created_at']);
            $table->index('submitted_at');
            $table->index('payment_completed_at');



        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesapal_transactions');
    }
};
