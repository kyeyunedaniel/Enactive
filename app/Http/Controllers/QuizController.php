<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestionAnswer;
use Inertia\Inertia;
class QuizController extends Controller
{
    public function show($quiz_id)
    {
        // Fetch the quiz with its associated questions, but only the first 5 questions for pagination
        $quiz = Quiz::with(['questions.answers'])->findOrFail($quiz_id);
        
        // Paginate questions
        $questions = $quiz->questions()->paginate(5); // Adjust the number per page as needed
    
        // Pass the quiz data and paginated questions to the view
        return Inertia::render('Quiz/TakeQuiz', [
            'quiz' => $quiz,
            'questions' => $questions,
        ]);
    }
    

    public function submitQuiz(Request $request, $quiz_id)
    {
        // Validate the incoming request data
        $request->validate([
            'answers' => 'required|array', // Ensure answers is an array
            'answers.*' => 'exists:answers,id', // Each answer ID must exist in the answers table
        ]);
    
        // Get the currently authenticated user
        $user = auth()->user();
    
        // Create a new quiz attempt
        $quizAttempt = QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $quiz_id,
            'completed_at' => now(), // Mark the attempt as completed
        ]);
    
        $score = 0; // Initialize score
    
        // Loop through each answer submitted
        foreach ($request->answers as $questionId => $answerId) {
            // Check if the answer is correct
            $isCorrect = $this->isAnswerCorrect($questionId, $answerId); // Implement this method based on your logic
    
            if ($isCorrect) {
                $score++; // Increment score for correct answers
            }
    
            // Store the question and answer relation
            QuizQuestionAnswer::create([
                'quiz_attempt_id' => $quizAttempt->id,
                'question_id' => $questionId,
                'answer_id' => $answerId,
            ]);
        }
    
        // Update the score in the quiz attempt
        $quizAttempt->update(['score' => $score]);
    
        // Optionally return a response
        return response()->json([
            'message' => 'Quiz submitted successfully!',
            'score' => $score,
        ]);
    }
    
    // Example method to check if the answer is correct
    private function isAnswerCorrect($questionId, $answerId)
    {
        // Logic to determine if the answer is correct
        // This could involve querying the database to check the correct answer for the question
        return \DB::table('answers')->where('id', $answerId)->where('is_correct', true)->exists();
    }
}
