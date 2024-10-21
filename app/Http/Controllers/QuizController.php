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
            'auth' => auth()->user()
        ]);
    }
    

    public function submitQuiz(Request $request, $quiz_id)
    {
        // Validate the incoming request data
        // dd("here"); 
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
        $totalQuestions = \DB::table('questions')->where('quiz_id', $quiz_id)->count();
    
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
        // return response()->json([
        //     'message' => 'Quiz submitted successfully!',
        //     'score' => $score,
        // ]);

        $percentageScore = ($totalQuestions > 0) ? ($score / $totalQuestions) * 100 : 0; // Avoid division by zero

        // return Inertia::render(route('quiz.results', ['quiz_id' => $quiz_id, 'score' => $score]));
        return Inertia::render('Quiz/QuizResults', [
            'quiz_id' => $quiz_id, 
            'score' => $score,
            'total_questions'=>$totalQuestions,
            'percentage_score'=>$percentageScore,
            'auth'=>auth()->user()
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


                // OUR QUIZ RESPONSE 

// {
//     "id": 1,
//     "course_id": 1,
//     "title": "Programming Basics Quiz",
//     "description": "Test your knowledge on programming basics.",
//     "is_active": 1,
//     "created_at": "2024-10-19T00:04:54.000000Z",
//     "updated_at": "2024-10-19T00:04:54.000000Z",
//     "questions": [
//         {
//             "id": 1,
//             "quiz_id": 1,
//             "question_text": "What is a variable?",
//             "question_type": "multiple_choice",
//             "created_at": "2024-10-19T00:05:31.000000Z",
//             "updated_at": "2024-10-19T00:05:31.000000Z",
//             "answers": [
//                 {
//                     "id": 1,
//                     "question_id": 1,
//                     "answer_text": "A container for storing data.",
//                     "is_correct": 1,
//                     "created_at": "2024-10-19T00:05:50.000000Z",
//                     "updated_at": "2024-10-19T00:05:50.000000Z"
//                 },
//                 {
//                     "id": 2,
//                     "question_id": 1,
//                     "answer_text": "A type of loop.",
//                     "is_correct": 0,
//                     "created_at": "2024-10-19T00:05:50.000000Z",
//                     "updated_at": "2024-10-19T00:05:50.000000Z"
//                 },
//                 {
//                     "id": 3,
//                     "question_id": 1,
//                     "answer_text": "An output command.",
//                     "is_correct": 0,
//                     "created_at": "2024-10-19T00:05:50.000000Z",
//                     "updated_at": "2024-10-19T00:05:50.000000Z"
//                 }
//             ]
//         },
//         {
//             "id": 2,
//             "quiz_id": 1,
//             "question_text": "What is a function?",
//             "question_type": "multiple_choice",
//             "created_at": "2024-10-19T00:05:31.000000Z",
//             "updated_at": "2024-10-19T00:05:31.000000Z",
//             "answers": [
//                 {
//                     "id": 4,
//                     "question_id": 2,
//                     "answer_text": "A reusable block of code.",
//                     "is_correct": 1,
//                     "created_at": "2024-10-19T00:05:50.000000Z",
//                     "updated_at": "2024-10-19T00:05:50.000000Z"
//                 },
//                 {
//                     "id": 5,
//                     "question_id": 2,
//                     "answer_text": "A type of data structure.",
//                     "is_correct": 0,
//                     "created_at": "2024-10-19T00:05:50.000000Z",
//                     "updated_at": "2024-10-19T00:05:50.000000Z"
//                 },
//                 {
//                     "id": 6,
//                     "question_id": 2,
//                     "answer_text": "An event handler.",
//                     "is_correct": 0,
//                     "created_at": "2024-10-19T00:05:50.000000Z",
//                     "updated_at": "2024-10-19T00:05:50.000000Z"
//                 }
//             ]
//         }
//     ]
// }