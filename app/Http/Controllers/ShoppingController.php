<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ShoppingController extends Controller
{
    // Projects/ShoppingProject/About
    public function about(){
     return Inertia::render('Projects/ShoppingProject/About',['auth' => auth()->user()]);
    }
}
