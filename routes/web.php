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
use App\Http\Controllers\AllContentController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\FrontEndValidationController;
//new controllers below 
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\PesapalController; 
use App\Http\Controllers\WalletTranactionController; 
use App\Http\Controllers\PesapalTransactionController;
use App\Http\Controllers\SupportersController; 


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
    // dd(Auth::user()->name); 
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'auth' => [
            'user' => Auth::user() ? Auth::user()->only('id', 'name', 'email', 'public_url_name') : null
        ],
        'header'=>'Welcome'
    ]);
    // return redirect()->route('dashboard.home');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Route::get('/home', function () {
//     return Inertia::render('DashboardScreens/HomeScreen'); //Pages/DashboardScreens/HomeScreen.jsx
// })->middleware(['auth', 'verified'])->name('dashboard.home');

Route::get('/home', [HomeController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard.home');

Route::get('/explore', function () {
    return Inertia::render('DashboardScreens/Explore'); //Pages/DashboardScreens/Explore.jsx
})->middleware(['auth', 'verified'])->name('dashboard.explore');

Route::get('/buttons&graphics', function () {
    return Inertia::render('DashboardScreens/ButtonsAndGraphics',[
        'auth' => [
            'user' => Auth::user() ? Auth::user()->only('id', 'name', 'email') : null
        ]
    ]); //Pages/DashboardScreens/Support.jsx
})->middleware(['auth', 'verified'])->name('dashboard.buttons&grahics');


Route::get('/settings', function () {
    return Inertia::render('DashboardScreens/Settings',[
        'auth' => [
            'user' => Auth::user() ? Auth::user()->only('id', 'name', 'email', 'public_url_name') : null
        ]
    ]); //Pages/DashboardScreens/Support.jsx
})->middleware(['auth', 'verified'])->name('dashboard.settings');

// Route::get('/payouts', function () {
//     return Inertia::render('DashboardScreens/Payouts',[
//         'auth' => [
//             'user' => Auth::user() ? Auth::user()->only('id', 'name', 'email', 'public_url_name') : null
//         ]
//     ]); //Pages/DashboardScreens/Support.jsx
// })->middleware(['auth', 'verified'])->name('dashboard.payout');

Route::get('/payouts',[HomeController::class,'MainDashboardPage'])->middleware(['auth', 'verified'])->name('dashboard.payout');

Route::get('/onboarding', function () {
    return Inertia::render('Onboarding',[
        'auth' => [
            'user' => Auth::user() ? Auth::user()->only('id', 'name', 'email', 'public_url_name') : null
        ]
    ]); //Pages/Onboarding.jsx
})->middleware(['auth', 'verified'])->name('onboarding.user');


// Route::get('/supporters', function () {
//     return Inertia::render('DashboardScreens/Supporters',[
//         'auth' => [
//             'user' => Auth::user() ? Auth::user()->only('id', 'name', 'email', 'public_url_name') : null
//         ]
//     ]); //Pages/DashboardScreens/Support.jsx
// })->middleware(['auth', 'verified'])->name('dashboard.support');

Route::get('/supporters',[SupportersController::class,'index'])->middleware(['auth', 'verified'])->name('dashboard.support');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware(['auth', 'verified'])->prefix('user')->group(function () {
    Route::get('/',[UserController::class, 'show'] )->name('user.index');
});

Route::post('/check_public_url_availability', [FrontEndValidationController::class, 'checkUsername'])->name('validate.checkUsername'); 

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/wallets', [WalletController::class, 'index'])->middleware('admin');
    Route::get('/wallets/{wallet}', [WalletController::class, 'show']);
    Route::get('/users/{user}/wallet', [WalletController::class, 'byUser']);
    Route::put('/wallets/{wallet}/approve', [WalletController::class, 'approve'])->middleware('admin');
    Route::put('/wallets/{wallet}/toggle-lock', [WalletController::class, 'toggleLock'])->middleware('admin');
    Route::put('/wallets/{wallet}/limits', [WalletController::class, 'updateLimits'])->middleware('admin');
    Route::get('/wallets/{wallet}/balance', [WalletController::class, 'getBalance']);
    Route::get('/wallets/{wallet}/withdrawal-limits', [WalletController::class, 'getWithdrawalLimits']);
    Route::post('/wallets/{wallet}/check-withdrawal', [WalletController::class, 'checkWithdrawalAllowed']);
});


Route::prefix('payment')->group(function () {
    Route::post('initiate-payment', [WalletTranactionController::class, 'makePayment'])->name('payment.make-payment');
    Route::post('/final/payment', [WalletTranactionController::class,'createTransaction'])->name('making-donation'); 
    Route::get('response-page', [PesapalTransactionController::class, 'handleCallback'])->name('pesapal.callback');
    Route::match(['get', 'post'], 'payment/callback', [PesapalTransactionController::class, 'handleCallback'])->name('payment.callback');
});








// here ############################### ############################ #############################

Route::get('/dashboard/redirect', function () {
    return response()->view('redirect-new-tab');
})->name('dashboard.redirect');

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
    Route::prefix('modules')->group(function () {
        Route::get('/', [ModuleController::class, 'index'])->name('modules.index');
        Route::get('/create', [ModuleController::class, 'create'])->name('modules.create');
        Route::post('/', [ModuleController::class, 'store'])->name('modules.store');
        Route::get('/{id}', [ModuleController::class, 'show'])->name('modules.show');
        Route::get('/{id}/edit', [ModuleController::class, 'edit'])->name('modules.edit');
        Route::put('/{id}', [ModuleController::class, 'update'])->name('modules.update');
        Route::delete('/{id}', [ModuleController::class, 'destroy'])->name('modules.destroy');
    });
   
});

Route::prefix('content-view')->group(function () {
    // Route::get('/', function () {
    //     return Inertia::render('ContentViews/HardcodedCatalogComponent',['auth' => Auth::user()]);
    // })->name('content-view.home');
    // Route::get('/', 'AllContentController@AllContent')->name('content-view.home');

    Route::get('/',[AllContentController::class, 'AllContent'])->name('content-view.home');
    Route::get('/geojson-data', [AllContentController::class, 'indexMap'])->name('content-map-view');
    Route::get('/video-show', [AllContentController::class, 'videoShow'])->name('content-video-show');


    Route::get('/view-course/{item}',[AllContentController::class, 'ViewCourse'])->name('content-view.course');
    Route::get('courses', [CourseController::class, 'index'])->name('courses.index.2');
    Route::post('/mark-module-complete', [AllContentController::class, 'updateProgress'])->name('update-module-progress');

});
// Passport::refreshTokensExpireIn(Carbon::now()->addDays(30));
Route::prefix('cart')->group(function () {
    Route::get('/view_cart', [CartController::class, 'index'])->name('cart-view.index');
});




Route::get('/{slug}.app', [PublicPageController::class, 'index'])
    ->where('slug', '[a-zA-Z0-9_-]+')
    ->name('public.page');

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


