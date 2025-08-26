<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wallet;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    //

        /**
     * Display the home dashboard screen.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();
        
        // Ensure the user has a wallet
        $wallet = $this->ensureUserWallet($user);
        
        return Inertia::render('DashboardScreens/HomeScreen', [
            // 'auth'=>$user,
            'balance' => $wallet->balance,
            'currency' => $wallet->currency,
            'walletStatus' => [
                'approved' => $wallet->approved,
                'is_locked' => $wallet->is_locked,
            ],
            'withdrawalLimits' => [
                'daily' => $wallet->daily_withdrawal_limit,
                'monthly' => $wallet->monthly_withdrawal_limit,
                'used_today' => $wallet->withdrawn_today,
                'used_this_month' => $wallet->withdrawn_this_month,
            ]
        ]);

        //auth objects -> needs the creatorlink as the username of the 
    }

    /**
     * Ensure the user has a wallet, create one if not.
     *
     * @param \App\Models\User $user
     * @return \App\Models\Wallet
     */
    protected function ensureUserWallet($user)
    {
        $wallet = Wallet::where('user_id', $user->id)->first();
        
        if (!$wallet) {
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0.00,
                'currency' => 'UGX',
                'approved' => false, // Default to false, admin must approve
                'is_locked' => false,
                'daily_withdrawal_limit' => 500000.00,
                'monthly_withdrawal_limit' => 5000000.00,
            ]);
            
            // You might want to trigger an event here to notify admins
            // about the new wallet that needs approval
        }
        
        return $wallet;
    }



    public function MainDashboardPage(){
         $user = Auth::user();

        $wallet = $this->ensureUserWallet($user);
        
        return Inertia::render('DashboardScreens/Payouts', [
            // 'auth'=>$user,
            'auth' => [
            'user' => Auth::user() ? Auth::user()->only('id', 'name', 'email', 'public_url_name','phone_number') : null
            ],
            'availableBalance' => $wallet->balance,
            'currency' => $wallet->currency,
            'walletStatus' => [
                'approved' => $wallet->approved,
                'is_locked' => $wallet->is_locked,
            ],
            'withdrawalLimits' => [
                'daily' => $wallet->daily_withdrawal_limit,
                'monthly' => $wallet->monthly_withdrawal_limit,
                'used_today' => $wallet->withdrawn_today,
                'used_this_month' => $wallet->withdrawn_this_month,
            ]
        ]);
    } 
    

}