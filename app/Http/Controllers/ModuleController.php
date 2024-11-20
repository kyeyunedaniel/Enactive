<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Module;
use App\Models\Course;
use Illuminate\Support\Facades\Auth; 
use Inertia\Inertia;

class ModuleController extends Controller
{
    public function index()
    {
        $user_id= Auth::user()->id;
        // dd($user_id);
        $courses = Course::where('created_by',$user_id)->get(); 
        // Fetch modules where the related course's `created_by` matches the logged-in user's ID
        $modules = Module::whereHas('course', function ($query) use ($user_id) {
            $query->where('created_by', $user_id);
        })->get();

        $response_message = session()->has('message_returned') ? session('message_returned') :'';
        $error_message = session()->has('error_message') ? session('error_message') :'';
        // dd($response_message);

        return Inertia::render('Courses/ModuleView', [
            'modules' => $modules,
            'auth'=>auth()->user(),
            'courses'=>$courses,
            'response_message'=>$response_message,
            'error_message'=>$error_message
        ]);

    }

    /**
     * Show the form for creating a new module.
     */
    public function create()
    {
        // Usually used for rendering a view in web apps, but skipped for API
    }

    /**
     * Store a newly created module in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'required|integer',
            'module_time' => 'required|integer',
        ]);

        $module = Module::create($request->all());

        return response()->json([
            'message' => 'Module created successfully',
            'module' => $module,
        ], 201);
    }

    /**
     * Display the specified module.
     */
    public function show($id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json(['message' => 'Module not found'], 404);
        }

        return response()->json($module, 200);
    }

    /**
     * Show the form for editing the specified module.
     */
    public function edit($id)
    {
        // Usually used for rendering a view in web apps, but skipped for API
    }

    /**
     * Update the specified module in storage.
     */
    public function update(Request $request, $id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json(['message' => 'Module not found'], 404);
        }

        $request->validate([
            'course_id' => 'sometimes|integer',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'order' => 'sometimes|integer',
            'module_time' => 'sometimes|integer',
        ]);

        $module->update($request->all());

        return response()->json([
            'message' => 'Module updated successfully',
            'module' => $module,
        ], 200);
    }

    /**
     * Remove the specified module from storage.
     */
    public function destroy($id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json(['message' => 'Module not found'], 404);
        }

        $module->delete();

        return response()->json(['message' => 'Module deleted successfully'], 200);
    }
}

