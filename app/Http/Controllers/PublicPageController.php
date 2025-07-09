<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User; 
use Inertia\Inertia;


class PublicPageController extends Controller
{
    //
    public function index($slug)
    {
        // Trim and convert to lowercase
        $slug = trim(strtolower($slug));
        
        // Validate the slug format
        if (!$this->isValidSlug($slug)) {
            return abort(404, 'Invalid page format');
        }
        
        // Check if slug is reserved
        if ($this->isReservedSlug($slug)) {
            return abort(404, 'Page not found');
        }
        
        // Find user by public_url_name
        $user = User::where('public_url_name', $slug)->first();
        
        if (!$user) {
            return abort(404, 'Page not found');
        }
        
        // Return Inertia response /Users/kyeyunedaniel/Desktop/PERSONAL-PROJECT/study-app/Enactive/resources/js/Pages/PublicPages/PublicView.jsx
        // return Inertia::render('PublicPages/PublicView', [
        //     'user' => [
        //         'name' => $user->name,
        //         'username' => $user->public_url_name,
        //         'avatar_url' => $user->avatar_url,
        //         'bio' => $user->bio ?? null,
        //         'wallet_id'=>$user->id,
        //         'created_at' => $user->created_at->format('Y-m-d'),
        //         // Add other public fields as needed
        //     ]
        // ]);
        $posts = array('');
        
        return Inertia::render('PublicPages/PublicView', [
    'user' => [
        // Basic Info
        'name' => $user->name,
        'username' => $user->public_url_name,
        'avatar_url' => $user->avatar_url,
        'email' => $user->public_email, // Consider privacy implications
        'bio' => $user->bio ?? null,
        'location' => $user->location ?? null,
        
        // Page Customization
        'page_title' => $user->page_title ?? $user->name,
        'page_subtitle' => $user->page_subtitle ?? 'Support my work',
        'theme_color' => $user->theme_color ?? '#10B981', // Default to emerald
        
        // Financial/Support
        'wallet_id' => $user->id,
        'coffee_price' => $user->coffee_price ?? 1000, // Default £5
        'goal_amount' => $user->monthly_goal ?? null,
        'current_month_amount' => $user->current_month_earnings ?? 0,
        'currency'=> $user->currency ?? 'UGX',
        
        // Social Links
        'social_links' => [
            'twitter' => $user->twitter_handle ? 'https://twitter.com/'.$user->twitter_handle : null,
            'instagram' => $user->instagram_handle ? 'https://instagram.com/'.$user->instagram_handle : null,
            'youtube' => $user->youtube_channel,
            'website' => $user->website_url,
        ],
        
        // Content
        'youtube_links' => $user->youtube_links ?? [], // Array of video URLs
        // 'featured_posts' => $posts()->public()->limit(3)->get()->map(function($post) {
        //     return [
        //         'title' => $post->title,
        //         'excerpt' => $post->excerpt,
        //         'url' => route('posts.show', $post),
        //         'published_at' => $post->published_at->format('M d, Y'),
        //     ];
        // }),
        
        // Stats/Metadata
        'created_at' => $user->created_at->format('Y-m-d'),
        // 'supporter_count' => $user->supporters()->count(),
        'is_verified' => $user->is_verified,
        
        // Preferences
        // 'accepts_custom_amounts' => $user->accepts_custom_amounts ?? true,
        // 'show_supporters' => $user->show_supporters ?? true,
        // 'show_goals' => $user->show_goals ?? true,
    ],
    // Optional: Add recent supporters if showing them
    'recent_supporters' => $user->show_supporters ? $user->supporters()
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function($supporter) {
            return [
                'name' => $supporter->anonymous ? 'Anonymous' : $supporter->name,
                'amount' => $supporter->amount,
                'message' => $supporter->message,
                'created_at' => $supporter->created_at->diffForHumans(),
            ];
        }) : [],
]);
    }
    
    private function isValidSlug($slug)
    {
        // Apply same validation rules as username
        return preg_match('/^[a-z0-9_]+$/', $slug) && 
               strlen($slug) >= 5 && 
               strlen($slug) <= 30;
    }
    
    private function isReservedSlug($slug)
    {
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
        
        // Check exact match
        if (in_array($slug, $reserved)) {
            return true;
        }
        
        // Block variations with numbers (e.g., admin1, admin123)
        foreach ($reserved as $word) {
            if (preg_match("/^{$word}\d*$/i", $slug)) {
                return true;
            }
        }
        
        // Block reversed versions
        foreach ($reserved as $word) {
            if ($slug === strrev($word)) {
                return true;
            }
        }
        
        // Block plural/singular variations
        foreach ($reserved as $word) {
            if ($slug === $word.'s' || $slug === substr($word, 0, -1)) {
                return true;
            }
        }
        
        return false;
    }
}
