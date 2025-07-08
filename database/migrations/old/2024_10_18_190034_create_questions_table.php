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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->onDelete('cascade'); // Reference to quizzes table
            $table->text('question_text');
            $table->enum('question_type', ['multiple_choice', 'true_false','short-answer'])->default('multiple_choice'); // Question type (could be expanded) multiple_choice,multiple_select,true_false,short_answer,fill_in_the_blank,matching,essay,numeric,ordering,drag_and_drop
            $table->boolean('is_active')->default(true); // Disable some questions from front-end
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
