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
        Schema::table('courses', function (Blueprint $table) {
            //
            // if (!Schema::hasColumn('courses', 'category_id')) {
            //     $table->unsignedBigInteger('category_id')->nullable()->default(1);
    
            //     // Add foreign key constraint if category_id column was added
            //     $table->foreign('category_id')->references('id')->on('categories')
            //           ->onDelete('cascade');
            // }
            // $table->foreignId('category_id')->constrained('categories')->default(1)->onDelete('cascade')->after('created_by');
            $table->unsignedBigInteger('category_id')->default(1)->after('created_by');

            // Step 2: Add the foreign key constraint.
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });

    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            //
            // $table->dropForeign('category_id');
            // $table->dropColumn('category_id');

            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }
};
