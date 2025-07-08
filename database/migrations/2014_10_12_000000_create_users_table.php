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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes(); // Important for compliance

            // Profile fields (requested to keep in main table)
            $table->string('profile_picture')->nullable();
            $table->text('bio')->nullable();
            $table->string('phone_number')->nullable();
            $table->unsignedBigInteger('role_id')->nullable();
            
            // Unique public identifier (required at registration)
            // Case-insensitive public_url_name with optimized indexing
            $table->string('public_url_name')
                ->collation('utf8mb4_unicode_ci') // Case-insensitive collation
                ->unique()
                ->index('idx_public_url_name_ci'); // Named index for monitoring
            
            // Verification and location
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('country_code', 3)->nullable(); // ISO country code
            $table->string('timezone')->nullable(); // For notifications
            
            // Digital presence
            $table->string('website_url')->nullable();
            $table->json('social_links')->nullable(); // Efficient storage for social media
            
            // Monetization status
            $table->boolean('is_creator')->default(false)->index();
            $table->timestamp('creator_since')->nullable();
        });

        // Add indexes for frequently queried columns
        Schema::table('users', function (Blueprint $table) {
            $table->index('role_id');
            $table->index('phone_number');
            $table->index('country_code');
            $table->index('public_url_name');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
