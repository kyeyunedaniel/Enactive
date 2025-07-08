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
        Schema::create('roles', function (Blueprint $table) {
           $table->id();
            $table->string('name')->unique(); // Role name
            $table->string('slug')->unique()->index(); // Added slug for better referencing
            $table->text('description')->nullable(); // Added description field
            $table->timestamps();
            $table->softDeletes(); // Added soft deletes for compliance
        });

        // Insert default roles with proper data structure
        DB::table('roles')->insert([
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'System administrator with full privileges',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'User',
                'slug' => 'user',
                'description' => 'Regular application user',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
            
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
