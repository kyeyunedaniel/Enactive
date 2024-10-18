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
            $table->string('profile_picture')->nullable(); // Add profile picture column
            $table->text('bio')->nullable();              // Add bio column
            $table->string('phone_number')->nullable();   // Add phone number column
            $table->string('role')->nullable();           // Make role column nullable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->dropColumn(['profile_picture', 'bio', 'phone_number', 'role']);
        });
    }
};
