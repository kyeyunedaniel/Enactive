<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\UserProgress;
use App\Models\Category; 

class AllContentController extends Controller
{
    //
    public function AllContent(){
        $courses = Course::get(); //( select * from courses )
        $auth=Auth::user();
        $categories = Category::get();
        // dd($categories); 
        // dd($courses);
        return Inertia::render('ContentViews/HardcodedCatalogComponent',
        [
            'auth' => $auth,
            'courses'=>$courses,
            'categories'=>$categories,
        ]
    );  
    }


public function ViewCourse($course_id)
{
    // Retrieve the authenticated user
    $auth = Auth::user();

    // Fetch the course based on authentication status
    if ($auth) {
        // For authenticated users, include quiz attempts and user progress
        $course = Course::with([
            'modules.quizzes.quizAttempts' => function ($query) use ($auth) {
                $query->where('user_id', $auth->id);
            },
            'modules.userProgress' => function ($query) use ($auth) {
                $query->where('user_id', $auth->id);
            }
        ])->findOrFail($course_id);
    } else {
        // For guests, only load the course without quiz attempts or progress
        $course = Course::with([
            'modules.quizzes',
            'modules' // Load modules only without specific user data
        ])->findOrFail($course_id);
    }

    // Render the course page with the relevant data
    return Inertia::render('Courses/ViewCourse', [
        'auth' => $auth,
        'course' => $course
    ]);
}


public function updateProgress(Request $request)
{
    // dd($request->all());
    try {
        // Validate the request
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'last_module_id' => 'required|exists:modules,id',
            'progress_percentage' => 'required|integer|min:0|max:100',
        ]);

        // Find or create the progress record
        $progress = UserProgress::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'course_id' => $request->course_id,
                'last_module_id' => $request->last_module_id,
            ],
            [
                'progress_percentage' => $request->progress_percentage,
                'updated_at' => now(),
            ]
        );

        // Redirect back to the same page (e.g., course page) after updating progress
        // return Inertia::render(route('content-view.course', ['item' => $request->course_id]), [
        //     'message' => 'Progress updated successfully',
        // ]);
        return to_route('content-view.course',['item' => $request->course_id]);

    } catch (\Exception $e) {
        \Log::error('Error updating progress: ' . $e->getMessage());

        // Return to the same page with an error message
        return response()->json([
            'success' => false,
            'message' => 'There was an error updating the progress. Please try again later.' .$e->getMessage(),
        ], 500); // 500 is a standard server error status code
    }
}


public function updateProgresss(Request $request)
{
    try {
        // Validate the incoming request
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'last_module_id' => 'required|exists:modules,id',
            'progress_percentage' => 'required|integer|min:0|max:100',
        ]);

        // Update or create the user progress
        $progress = UserProgress::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'course_id' => $request->course_id,
                'last_module_id' => $request->last_module_id,
            ],
            [
                'progress_percentage' => $request->progress_percentage,
                'updated_at' => now(),
            ]
        );

        // Return a successful JSON response
        return response()->json([
            // 'success' => true,
            // 'message' => 'Progress updated successfully',
            // 'data' => $progress, // Optionally, return the updated progress data
        ],202);

    } catch (\Exception $e) {
        // Log the error for debugging purposes
        \Log::error('Error updating progress: ' . $e->getMessage());

        // Return an error response
        return response()->json([
            'success' => false,
            'message' => 'There was an error updating the progress. Please try again later.',
        ], 500); // 500 is a standard server error status code
    }
}


// public function updateProgress(Request $request)
// {
//     try {
//         // Validate the request
//         $this->validateProgress($request);

//         // Find or create the progress record
//         $progress = $this->updateOrCreateProgress($request);

//         // Return a successful response with the updated progress
//         return $this->redirectWithMessage($request->course_id, 'Progress updated successfully');
        
//     } catch (\Exception $e) {
//         \Log::error('Error updating progress: ' . $e->getMessage());
//         return $this->redirectWithMessage($request->course_id, 'There was an error updating the progress. Please try again later.');
//     }
// }

// private function validateProgress(Request $request)
// {
//     $request->validate([
//         'user_id' => 'required|exists:users,id',
//         'course_id' => 'required|exists:courses,id',
//         'last_module_id' => 'required|exists:modules,id',
//         'progress_percentage' => 'required|integer|min:0|max:100',
//     ]);
// }

// private function updateOrCreateProgress(Request $request)
// {
//     return UserProgress::updateOrCreate(
//         [
//             'user_id' => $request->user_id,
//             'course_id' => $request->course_id,
//             'last_module_id' => $request->last_module_id,
//         ],
//         [
//             'progress_percentage' => $request->progress_percentage,
//             'updated_at' => now(),
//         ]
//     );
// }

// private function redirectWithMessage($courseId, $message)
// {
//     return Inertia::render(route('content-view.course', ['item' => $courseId]), [
//         'message' => $message,
//     ]);
// }

}
