<?php

namespace App\Http\Controllers;

use App\Models\WalletTranaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Auth; 

class SupportersController extends Controller
{
    /**
     * Display the supporters page with transactions
     */
   public function index(Request $request)
    {
        $user = $request->user();
        
        // Get the user's wallet
        $wallet = Wallet::where('user_id', $user->id)->first();
        
        if (!$wallet) {
            // Create a wallet if it doesn't exist and return empty data
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
                'currency' => 'UGX',
                'approved' => true,
                'is_locked' => false,
                'daily_withdrawal_limit' => 1000000,
                'monthly_withdrawal_limit' => 5000000,
            ]);
            
            // Return empty data since this is a new wallet
            return Inertia::render('DashboardScreens/Supporters', [
                'auth' => [
                    'user' => Auth::user()->only('id', 'name', 'email', 'public_url_name')
                ],
                'stats' => [
                    'totalSupporters' => 0,
                    'last30DaysAmount' => 0,
                    'allTimeAmount' => 0,
                ],
                'transactions' => ['data' => [], 'total' => 0],
                'wallet' => $wallet,
            ]);
        }

        // dd($wallet->id); 

        // Get supporter transactions (donations received)
        $transactions = WalletTranaction::where('wallet_id', $wallet->id)
            // ->where('transaction_type', 'donation_received')
            ->where('status', 'completed')
            ->with(['wallet.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

            // dd($transactions); 
        // Calculate stats
        $totalSupporters = WalletTranaction::where('wallet_id', $wallet->id)
            // ->where('transaction_type', 'donation_received')
            ->where('status', 'completed')
            ->distinct('reference_id')
            ->count();

        $last30DaysAmount = WalletTranaction::where('wallet_id', $wallet->id)
            // ->where('transaction_type', 'donation_received')
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('amount');

        $allTimeAmount = WalletTranaction::where('wallet_id', $wallet->id)
            // ->where('transaction_type', 'donation_received')
            ->where('status', 'completed')
            ->sum('amount');

        return Inertia::render('DashboardScreens/Supporters', [
            'auth' => [
                'user' => Auth::user()->only('id', 'name', 'email', 'public_url_name')
            ],
            'stats' => [
                'totalSupporters' => $totalSupporters,
                'last30DaysAmount' => $last30DaysAmount,
                'allTimeAmount' => $allTimeAmount,
            ],
            'transactions' => $transactions,
            'wallet' => $wallet,
        ]);
    }

    /**
     * Get supporter transactions via API (for filtering/pagination)
     */
    public function getTransactions(Request $request)
    {
        $user = $request->user();
        $wallet = Wallet::where('user_id', $user->id)->first();

        if (!$wallet) {
            return response()->json(['transactions' => []]);
        }

        $query = WalletTranaction::where('wallet_id', $wallet->id)
            ->where('transaction_type', 'donation_received')
            ->where('status', 'completed')
            ->with(['wallet.user']);

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json($transactions);
    }
}