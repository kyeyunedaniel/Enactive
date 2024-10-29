<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use Inertia\Inertia;

class CourseController extends Controller
{
    //
    public function index()
    {
        // Fetch all courses
        $courses = Course::all();
        
        return Inertia::render('Courses/ManageCourses', [
            'courses' => $courses,
            'auth'=>auth()->user()
        ]);
    }

    public function store(Request $request)
{
    // dd($request->course_price);
    try {
        // Validate incoming request data
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate image file
            'video_url' => 'nullable|mimetypes:video/mp4,video/x-msvideo,video/x-matroska,video/quicktime|max:20480', // Validate video file including MOV
            'course_price'=>'nullable|string'
        ]);

        // dd('here');
        // Assign validated data to variables
        $title = $request->title;
        $description = $request->description;
        $created_by = auth()->user()->id;
        $course_price = $request->course_price;

        // Create a new Course instance
        $course = new Course; 
        $course->title = $title; 
        $course->description = $description;
        $course->course_price = (int)$course_price;
        $course->created_by = $created_by; 
        
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

        return redirect()->route('courses.index')->with('success', 'Course created successfully!');
    } catch (\Exception $error) {
        // dd($error);
        return (['error' => $error->getMessage()]); // Return back with error message
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

        return redirect()->route('courses.index')->with('success', 'Course updated successfully!');
    } catch (\Exception $error) {
        return response()->json(['error' => $error->getMessage()]); // Return with error message
    }
}


    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('courses.index')->with('success', 'Course deleted successfully!');
    }
}
