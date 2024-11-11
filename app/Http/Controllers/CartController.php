<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    //
    public function Index(){
        // dd('cart_controller ');
        return Inertia::render('Cart/ViewCart', [
            'auth'=>auth()->user()
        ]);
    }
}
