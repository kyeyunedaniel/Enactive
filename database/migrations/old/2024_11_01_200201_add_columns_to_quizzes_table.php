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
        Schema::table('quizzes', function (Blueprint $table) {
            //
            $table->unsignedBigInteger('module_id')->nullable();
            $table->boolean('is_final')->default(false); // true if it's the final course quiz

            $table->foreign('module_id')->references('id')->on('modules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            //
            $table->dropForeign(['module_id']);
            $table->dropColumn(['module_id', 'is_final']);
        });
    }
};
