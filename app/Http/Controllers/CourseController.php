<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Category;
use Inertia\Inertia;

class CourseController extends Controller
{
    //
    public function index()
    {
        // Fetch all courses
        $courses = Course::all();
        $categories = Category::get();
        $response_message = session()->has('message_returned') ? session('message_returned') :'';
        $error_message = session()->has('error_message') ? session('error_message') :'';
        // dd($response_message);

        return Inertia::render('Courses/ManageCourses', [
            'courses' => $courses,
            'auth'=>auth()->user(),
            'categories'=>$categories,
            'response_message'=>$response_message,
            'error_message'=>$error_message
        ]);
    }

//     public function index()
// {
//     // Fetch all courses
//     $courses = Course::all();
//     $categories = Category::get();

//     // Check if session data exists
//     $extraData = session()->has('message_returned') ? ['response_message' => session('message_returned')] : [];
//     // dd($extraData);

//     // Merge session data with other data and pass to Inertia
//     return Inertia::render('Courses/ManageCourses', array_merge([
//         'courses' => $courses,
//         'auth' => auth()->user(),
//         'categories' => $categories,
//     ], $extraData));
// }



    public function store(Request $request)
{
    // dd($request->course_price);
    try {
        // Validate incoming request data
        $request->validate([
            'title' => 'required|string|max:255|unique:courses',
            'description' => 'nullable|string',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate image file
            'video_url' => 'nullable|mimetypes:video/mp4,video/x-msvideo,video/x-matroska,video/quicktime|max:20480', // Validate video file including MOV
            'course_price'=>'nullable|string',
            'course_background'=>'required|string', 
            'category_id'=>'required|numeric',
            'course_objectives'=>'required|string', 
            'intended_for'=>'nullable|string', 
            'expected_outcomes'=>'nullable|string',
            'certificate'=>'required|boolean',
            'course_time'=>'required|string',
        ]);

        // dd('here');
        // Assign validated data to variables
        $title = $request->title;
        $description = $request->description;
        $created_by = auth()->user()->id;
        $course_price = $request->course_price;
        $course_background = $request->course_background;
        $category_id = $request->category_id;
        $course_objectives = $request->course_objectives;
        $intended_for = $request->intended_for;
        $expected_outcomes = $request->expected_outcomes;
        $certificate = $request->certificate;
        $course_time = $request->course_time;


        // Create a new Course instance
        $course = new Course; 
        $course->title = $title; 
        $course->description = $description;
        $course->course_price = (int)$course_price;
        $course->created_by = $created_by; 

        $course->course_background = $course_background; 
        $course->category_id = $category_id; 
        $course->course_objectives = $course_objectives; 
        $course->intended_for = $intended_for; 
        $course->expected_outcomes = $expected_outcomes; 
        $course->certificate = $certificate; 
        $course->course_time = $course_time; 


        
        // Handle the image upload if present
        if ($request->hasFile('image_url')) {
            $imageExtension = $request->file('image_url')->getClientOriginalExtension(); // Get the original file extension
            $imageName = 'image_' . time() . '.' . $imageExtension; // Create a new filename with timestamp
            $imagePath = $request->file('image_url')->storeAs('images/courses', $imageName, 'public'); // Store with new name
            $imageUrl = url('storage/images/courses/' . $imageName);
            $course->image_url = $imageUrl; // Save the path in the database
        }

        // Handle the video upload if present
        if ($request->hasFile('video_url')) {
            $videoExtension = $request->file('video_url')->getClientOriginalExtension(); // Get the original file extension
            $videoName = 'video_' . time() . '.' . $videoExtension; // Create a new filename with timestamp
            $videoPath = $request->file('video_url')->storeAs('videos/courses', $videoName, 'public'); // Store with new name
            // $course->video_url = $videoPath; // Save the path in the database
            $videoUrl = url('storage/videos/courses/' . $videoName);
            $course->video_url = $videoUrl;
        }

        // Save the course to the database
            $course->save(); 

        return redirect()->route('courses.index')->with('message_returned', 'Course created successfully!');
    } catch (\Exception $error) {
        // dd($error);
        // return (['error' => $error->getMessage()]); // Return back with error message
        return redirect()->route('courses.index')->with('error_message', $error->getMessage());
        
    }
}

public function update(Request $request, $course_id)
{
    try {
        // Find the course by its ID
        $course = Course::findOrFail($course_id);

        // Prepare validation rules
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'course_price' => 'nullable|string',
            'course_background'=>'required|string', 
            'category_id'=>'required|numeric',
            'course_objectives'=>'required|string', 
            'intended_for'=>'nullable|string', 
            'expected_outcomes'=>'nullable|string',
            'certificate'=>'required|boolean',
            'course_time'=>'required|string',
        ];

        // Validate image_url based on whether it's an upload or a URL
        if ($request->hasFile('image_url')) {
            $rules['image_url'] = 'image|mimes:jpeg,png,jpg,gif|max:2048'; // Validate as image upload
        } elseif ($request->filled('image_url')) {
            $rules['image_url'] = 'url'; // Validate as URL if provided
        }

        // Validate video_url if a file is provided
        if ($request->hasFile('video_url')) {
            $rules['video_url'] = 'mimetypes:video/mp4,video/x-msvideo,video/x-matroska,video/quicktime|max:20480'; // Validate video file
        }

        // Validate incoming request data
        $request->validate($rules);

        // Update the course details
        $course->title = $request->input('title');
        $course->description = $request->input('description');
        $course->course_price = (int)$request->course_price;
        $course->course_background = $request->course_background;
        $course->category_id = $request->category_id;
        $course->course_objectives = $request->course_objectives;
        $course->intended_for = $request->intended_for;
        $course->expected_outcomes = $request->expected_outcomes;
        $course->certificate = $request->certificate;
        $course->course_time = $request->course_time;



        // Handle the image upload if a new image is present
        if ($request->hasFile('image_url')) {
            // Delete the old image if it exists
            if ($course->image_url) {
                $oldImagePath = str_replace(url('storage/'), 'storage/', $course->image_url);
                if (file_exists(public_path($oldImagePath))) {
                    unlink(public_path($oldImagePath)); // Delete the old file
                }
            }

            // Upload the new image
            $imageExtension = $request->file('image_url')->getClientOriginalExtension();
            $imageName = 'image_' . time() . '.' . $imageExtension;
            $imagePath = $request->file('image_url')->storeAs('images/courses', $imageName, 'public');
            $course->image_url = url('storage/images/courses/' . $imageName); // Save the new image URL
        } elseif ($request->filled('image_url')) {
            // If image_url is provided as a URL, just update it
            $course->image_url = $request->input('image_url');
        }

        // Handle the video upload if a new video is present
        if ($request->hasFile('video_url')) {
            // Delete the old video if it exists
            if ($course->video_url) {
                $oldVideoPath = str_replace(url('storage/'), 'storage/', $course->video_url);
                if (file_exists(public_path($oldVideoPath))) {
                    unlink(public_path($oldVideoPath)); // Delete the old file
                }
            }

            // Upload the new video
            $videoExtension = $request->file('video_url')->getClientOriginalExtension();
            $videoName = 'video_' . time() . '.' . $videoExtension;
            $videoPath = $request->file('video_url')->storeAs('videos/courses', $videoName, 'public');
            $course->video_url = url('storage/videos/courses/' . $videoName); // Save the new video URL
        }

        // Save the updated course to the database
        $course->save();

        return redirect()->route('courses.index')->with('message_returned', 'Course updated successfully!');
    } catch (\Exception $error) {
        // return response()->json(['error' => $error->getMessage()]); // Return with error message
        return redirect()->route('courses.index')->with('error_message', $error->getMessage());
    }
}


public function destroy(Course $course)

{
    try{
    // Delete the associated image if it exists
    if ($course->image_url) {
        $imagePath = str_replace(url('storage/'), 'storage/', $course->image_url); // Adjust the URL to file path
        if (file_exists(public_path($imagePath))) {
            unlink(public_path($imagePath)); // Delete the old image file
        }
    }

    // Delete the associated video if it exists
    if ($course->video_url) {
        $videoPath = str_replace(url('storage/'), 'storage/', $course->video_url); // Adjust the URL to file path
        if (file_exists(public_path($videoPath))) {
            unlink(public_path($videoPath)); // Delete the old video file
        }
    }

    // Delete the course record from the database
    $course->delete();

    return redirect()->route('courses.index')->with('message_returned', 'Course deleted successfully!');

}catch(\Exceprion $error){
    return redirect()->route('courses.index')->with('error_message', $error->getMessage());
    }
}
}