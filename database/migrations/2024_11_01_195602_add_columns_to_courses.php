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
            $table->text('course_description')->nullable();
            $table->text('course_objectives')->nullable();
            $table->text('intended_for')->nullable();
            $table->text('expected_outcomes')->nullable();
            $table->boolean('certificate')->default(false);
            $table->integer('course_time')->nullable(); // estimated time in minutes or hours
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            //
            $table->dropColumn([
                'course_description', 
                'course_objectives', 
                'intended_for', 
                'expected_outcomes', 
                'certificate', 
                'course_time'
            ]);
        });
    }
};
