<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AllContentController extends Controller
{
    //
    public function AllContent(){
        $courses = Course::get();
        $auth=Auth::user();
        // dd($courses);
        return Inertia::render('ContentViews/HardcodedCatalogComponent',[
            'auth' => $auth,
            'courses'=>$courses
        ]);  
    }
    public function ViewCourse(){
        $auth=Auth::user();
        
        // return Inertia::render('Courses/ViewCourse',['auth'=>$auth]);
         return Inertia::render('Courses/ViewCourse')->with([
            'auth'=>$auth
        ]);
    }
}
