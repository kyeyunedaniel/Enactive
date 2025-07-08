<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;


class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'username' => [
            'required',
            'string',
            'min:4',
            'max:30',
            'regex:/^[a-z0-9_]+$/',
            Rule::unique('users', 'public_url_name'),
            function ($attribute, $value, $fail) {
                $reservedWords = [
                // Admin-related (5+ chars)
                'admin', 'administrator', 'moderator', 'sysadmin', 'webmaster', 'manager', 
                'controller', 'verified',
                
                // System terms (5+ chars)
                'system', 'server', 'localhost', 'internal',
                
                // Common application terms (5+ chars)
                'application', 'dashboard', 'profile', 'account', 'settings', 'config',
                'login', 'signin', 'register', 'signup', 'logout', 'password', 'verify',
                'email',
                
                // Security terms (5+ chars)
                'security', 'secure', 'authentication', 'authorization',
                
                // Common routes/actions (5+ chars)
                'create', 'update', 'delete', 'remove', 'search',
                
                // Tech stack terms (5+ chars)
                'laravel', 'mysql', 'javascript', 'python',
                
                // Company/organization specific (5+ chars)
                'creators', 'creatorsfuel', 'creatorfuel', 'platform', 'service', 'official',
                
                // Generic reserved (5+ chars)
                'anonymous', 'unknown', 'undefined',
                
                // Common words (5+ chars)
                'official', 'verified', 'premium', 'basic'
            ];
                
                if (in_array(strtolower($value), $reservedWords)) {
                    $fail('public name not available');
                }
            },
        ],
        ]);


        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'public_url_name'=>$request->username
        ]);


        event(new Registered($user));

        Auth::login($user);

        return redirect(RouteServiceProvider::HOME);
    }
}
