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
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('balance', 15, 2)->default(0.00)->comment('Balance in UGX');
            $table->string('currency', 3)->default('UGX');
            $table->boolean('approved')->default(false)->comment('Admin approval status');
            $table->boolean('is_locked')->default(false)->comment('Temporary lock status');
            $table->decimal('daily_withdrawal_limit', 15, 2)->default(500000.00);
            $table->decimal('monthly_withdrawal_limit', 15, 2)->default(5000000.00);
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'approved', 'is_locked']);
            $table->index(['currency', 'approved']);
            
            
       
        });
// Add constraints via raw SQL after table creation
         DB::statement('ALTER TABLE wallets ADD CONSTRAINT chk_wallet_balance_non_negative CHECK (balance >= 0)');
        DB::statement('ALTER TABLE wallets ADD CONSTRAINT chk_daily_limit_non_negative CHECK (daily_withdrawal_limit >= 0)');
        DB::statement('ALTER TABLE wallets ADD CONSTRAINT chk_monthly_limit_non_negative CHECK (monthly_withdrawal_limit >= 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
