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
        Schema::table('users', function (Blueprint $table) {
            //
             $table->unsignedBigInteger('role_id')
                ->default(2) // Your default role ID
                ->nullable()  // Only if using ON DELETE SET NULL
                ->change();
            
            // 2. Add foreign key constraint
            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->onDelete('set null'); // or 'cascade' or 'restrict'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->dropForeign(['role_id']);
            
            // Optional: remove default if needed
            $table->unsignedBigInteger('role_id')
                ->nullable()
                ->default(null)
                ->change();
        });
    }
};
