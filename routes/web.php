<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShoppingController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->prefix('user')->group(function () {
    Route::get('/',[UserController::class, 'show'] )->name('user.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('shopping')->group(function () {
   Route::get('about', [ShoppingController::class, 'about'])->name('shopping.about'); 
});

Route::middleware(['auth'])->group(function () {
    // use App\Http\Controllers\QuizController;
    Route::prefix('quiz')->group(function () {
        Route::get('/{quiz_id}', [QuizController::class, 'show'])->name('quiz.show');
        Route::post('/{quiz_id}', [QuizController::class, 'submitQuiz'])->name('quiz.submit');     
    });

    Route::prefix('course')->group(function(){
        Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
        Route::get('courses/create', [CourseController::class, 'create'])->name('courses.create');
        Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
        Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
        Route::get('courses/{course}/edit', [CourseController::class, 'edit'])->name('courses.edit');
        Route::post('courses/{course}', [CourseController::class, 'update'])->name('courses.update');
        Route::delete('courses/{course}', [CourseController::class, 'destroy'])->name('courses.destroy');
    });
   
});

Route::prefix('content-view')->group(function () {
    Route::get('/', function () {
        return Inertia::render('ContentViews/HardcodedCatalogComponent',['auth' => Auth::user()]);
    })->name('content-view.home');
    Route::get('courses', [CourseController::class, 'index'])->name('courses.index.2');

});
require __DIR__.'/auth.php';


// Route::resource('courses', CourseController::class)->names([
//     'index' => 'courses.list',
//     'create' => 'courses.add',
//     'store' => 'courses.save',
//     'show' => 'courses.view',
//     'edit' => 'courses.edit',
//     'update' => 'courses.modify',
//     'destroy' => 'courses.remove',
// ]);