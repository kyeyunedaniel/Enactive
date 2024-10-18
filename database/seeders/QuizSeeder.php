<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;               // Import Course model
use App\Models\Quiz;                 // Import Quiz model
use App\Models\QuizQuestion;         // Import QuizQuestion model
use App\Models\QuizQuestionAnswer;   // Import QuizQuestionAnswer model

use App\Database\Factories\CourseFactory;
 
class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        {
            // Create a course
            $course = Course::factory()->create();
    
            // Create a quiz for that course
            $quiz = Quiz::factory()->create([
                'course_id' => $course->id,
            ]);
    
            // Create two questions for the quiz
            $questions = QuizQuestion::factory(2)->create([
                'quiz_id' => $quiz->id,
            ]);
    
            // Create answers for each question
            foreach ($questions as $question) {
                QuizQuestionAnswer::factory(3)->create([
                    'quiz_question_id' => $question->id,
                    'is_correct' => false, // Default incorrect answers
                ]);
    
                // Create one correct answer
                QuizQuestionAnswer::factory()->create([
                    'quiz_question_id' => $question->id,
                    'is_correct' => true, // One correct answer per question
                ]);
            }
        }
    }
}
