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
            $table->foreign('role_id') // Specify the column that is the foreign key
            ->references('id') // The column in the referenced table (roles)
            ->on('roles') // The table to reference
            ->default(1)
            ->onDelete('set null'); // Optional: set to null if the role is deleted
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
        });
    }
};
