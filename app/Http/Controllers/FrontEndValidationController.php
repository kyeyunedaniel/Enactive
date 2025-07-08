<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
// use 

class FrontEndValidationController extends Controller
{
    //
    public function checkUsername1(Request $request)
    {
        // dd("we get here "); 
        try {
            $validator = Validator::make($request->all(), [
                'username' => [
                    'required',
                    'string',
                    'min:4',
                    'max:30',
                    'regex:/^[a-z0-9_]+$/',
                    Rule::unique('users', 'public_url_name'),
                    function ($attribute, $value, $fail) {
                        $reservedWords = ['admin', 'system', 'root', 'support', 
                                        'select', 'insert', 'delete', 'update', 
                                        'drop', 'alter', 'create', 'modify'];
                        
                        if (in_array(strtolower($value), $reservedWords)) {
                            $fail('This username is taken. Try another.');
                        }
                    },
                ],
            ]);

            if ($validator->fails()) {
                $message = $validator->errors()->first();
                
                if (strlen($request->username) < 4) {
                    $message = 'Must be at least 4 characters.';
                } elseif (strlen($request->username) > 30) {
                    $message = 'Must be 30 characters or less.';
                }

                return response()->json([
                    'available' => false,
                    'message' => $message
                ], 422);
            }

            return response()->json([
                'available' => true,
                'message' => 'Available!'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'available' => false,
                'message' => 'Server error during validation'
            ], 500);
        }
    }

    public function checkUsername(Request $request)
{
    $valid = $request->validate([
        'username' => [
            'required',
            'string',
            'min:5',
            'max:30',
            'regex:/^[a-z0-9_]+$/',
            Rule::unique('users', 'public_url_name'),
            function ($attr, $value, $fail) {
                // Expanded list of reserved words
                            $reserved = [
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
                
                // Block variations with numbers (e.g., admin1, admin123)
                foreach ($reserved as $word) {
                    if (preg_match("/^{$word}\d*$/i", strtolower($value))) {
                        $fail('This username is not available.');
                        return;
                    }
                }
                
                // Block reversed versions
                foreach ($reserved as $word) {
                    if (strtolower($value) === strrev(strtolower($word))) {
                        $fail('This username is not available.');
                        return;
                    }
                }
                
                // Block plural/singular variations
                foreach ($reserved as $word) {
                    if (strtolower($value) === strtolower($word).'s' || 
                        strtolower($value) === substr(strtolower($word), 0, -1)) {
                        $fail('This username is not available.');
                        return;
                    }
                }
            }
        ]
    ]);

    return response()->json(['available' => true]);
}
}
