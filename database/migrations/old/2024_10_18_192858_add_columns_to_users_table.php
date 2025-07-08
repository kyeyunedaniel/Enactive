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
            $table->string('profile_picture')->nullable()->after('email'); // Add profile picture column
            $table->text('bio')->nullable()->after('profile_picture');              // Add bio column
            $table->string('phone_number')->nullable()->after('bio');   // Add phone number column
            $table->unsignedBigInteger('role_id')->nullable()->after('name');           // Make role column nullable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->dropColumn(['profile_picture', 'bio', 'phone_number', 'role_id']);
        });
    }
};
