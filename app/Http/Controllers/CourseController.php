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
        try{
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $title = $request->title;
        $description = $request->description;
        $created_by = auth()->user()->id;
        
        // Course::create($request->all());
        
        $course = new course; 
        $course->title = $title; 
        $course->description = $description;
        $course->created_by = $created_by; 
        $course->save(); 

        return redirect()->route('courses.index')->with('success', 'Course updated successfully!');

    }
        catch(\Exception $error){
            return $error->getMessage(); 
        }
    }

    public function update(Request $request, $course_id)
    {

        // dd($request->all()); 
        // Validate incoming request data
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
    
        // Find the course by its ID
        $course = Course::findOrFail($course_id);
    
        // Update the course with validated data
        $course->update([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
        ]);
    
        // Redirect back with a success message
        return redirect()->route('courses.index')->with('success', 'Course updated successfully!');
    }


    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('courses.index')->with('success', 'Course deleted successfully!');
    }
}
