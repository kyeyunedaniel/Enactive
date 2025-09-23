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
            ->paginate(6);

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
    // public function getTransactions(Request $request)
    // {
    //     $user = $request->user();
    //     $wallet = Wallet::where('user_id', $user->id)->first();

    //     if (!$wallet) {
    //         return response()->json(['transactions' => []]);
    //     }

    //     $query = WalletTranaction::where('wallet_id', $wallet->id)
    //         ->where('transaction_type', 'donation_received')
    //         ->where('status', 'completed')
    //         ->with(['wallet.user']);

    //     // Filter by date range if provided
    //     if ($request->has('start_date') && $request->has('end_date')) {
    //         $query->whereBetween('created_at', [
    //             $request->start_date,
    //             $request->end_date
    //         ]);
    //     }

    //     $transactions = $query->orderBy('created_at', 'desc')
    //         ->paginate($request->get('per_page', 10));

    //     return response()->json($transactions);
    // }

    //  public function getTransactions(Request $request)
    // {
    //     $user = $request->user();
        
    //     // Get the user's wallet
    //     $wallet = Wallet::where('user_id', $user->id)->first();

    //     if (!$wallet) {
    //         return response()->json([
    //             'data' => [],
    //             'total' => 0,
    //             'current_page' => 1,
    //             'last_page' => 1,
    //         ]);
    //     }

    //     try {
    //         $query = WalletTranaction::where('wallet_id', $wallet->id)
    //             ->where('transaction_type', 'donation_received')
    //             ->where('status', 'completed')
    //             ->with(['wallet.user'])
    //             ->orderBy('created_at', 'desc');

    //         // Apply date filters if provided
    //         if ($request->has('start_date') && $request->filled('start_date')) {
    //             $query->whereDate('created_at', '>=', $request->start_date);
    //         }

    //         if ($request->has('end_date') && $request->filled('end_date')) {
    //             $query->whereDate('created_at', '<=', $request->end_date);
    //         }

    //         // Apply search filter if provided
    //         if ($request->has('search') && $request->filled('search')) {
    //             $searchTerm = $request->search;
    //             $query->where(function ($q) use ($searchTerm) {
    //                 $q->where('description', 'like', "%{$searchTerm}%")
    //                   ->orWhere('amount', 'like', "%{$searchTerm}%")
    //                   ->orWhereJsonContains('metadata->supporter_name', $searchTerm);
    //             });
    //         }

    //         $perPage = $request->get('per_page', 2);
    //         $transactions = $query->paginate($perPage);

    //         return response()->json($transactions);

    //     } catch (\Exception $e) {
    //         \Log::error('Error fetching supporter transactions: ' . $e->getMessage());
            
    //         return response()->json([
    //             'error' => 'Failed to fetch transactions',
    //             'message' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function getTransactions(Request $request)
    {
        $request->validate([
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'search' => 'sometimes|string|max:255',
        ]);

        $user = $request->user();
        
        $wallet = Wallet::where('user_id', $user->id)->firstOrFail();

        $query = WalletTranaction::where('wallet_id', $wallet->id)
            ->where('transaction_type', 'donation_received')
            ->where('status', 'completed')
            ->with(['wallet.user'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        $this->applyFilters($query, $request);

        $perPage = $request->get('per_page', 10);
        $transactions = $query->paginate($perPage);

        // Transform data for frontend
        $transformedData = $transactions->through(function ($transaction) {
            return [
                'id' => $transaction->id,
                'amount' => $transaction->amount,
                'description' => $transaction->description,
                'status' => $transaction->status,
                'created_at' => $transaction->created_at,
                'metadata' => $transaction->metadata,
                'supporter_name' => $transaction->metadata['supporter_name'] ?? 
                                  $transaction->metadata['donor_name'] ?? 
                                  $this->extractSupporterName($transaction->description) ?? 
                                  'Anonymous Supporter',
                'formatted_amount' => 'UGX ' . number_format($transaction->amount, 2),
                'formatted_date' => $transaction->created_at->format('M j, Y \a\t g:i A'),
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'from' => $transactions->firstItem(),
                'to' => $transactions->lastItem(),
            ],
            'links' => $transactions->linkCollection()->toArray(),
        ]);
    }

    private function applyFilters($query, Request $request): void
    {
        // Date range filter
        if ($request->has('start_date') && $request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search filter
        if ($request->has('search') && $request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('description', 'like', "%{$searchTerm}%")
                  ->orWhere('amount', 'like', "%{$searchTerm}%")
                  ->orWhereJsonContains('metadata->supporter_name', $searchTerm)
                  ->orWhereJsonContains('metadata->donor_name', $searchTerm);
            });
        }
    }

    private function extractSupporterName(string $description): ?string
    {
        // Extract name from common description patterns
        if (preg_match('/from\s+(.+)$/i', $description, $matches)) {
            return trim($matches[1]);
        }
        
        if (preg_match('/donation\s+from\s+(.+)$/i', $description, $matches)) {
            return trim($matches[1]);
        }
        
        return null;
    }
}