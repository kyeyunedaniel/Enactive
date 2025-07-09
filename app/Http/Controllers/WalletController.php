<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wallet;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class WalletController extends Controller
{
    /**
     * Display a listing of wallets (admin only).
     */
    public function index(Request $request)
    {
        $query = Wallet::with('user');

        // Filter by approval status if provided
        if ($request->has('approved')) {
            $query->where('approved', $request->boolean('approved'));
        }

        // Filter by locked status if provided
        if ($request->has('is_locked')) {
            $query->where('is_locked', $request->boolean('is_locked'));
        }

        // Filter by currency if provided
        if ($request->has('currency')) {
            $query->where('currency', strtoupper($request->currency));
        }

        $wallets = $query->paginate(20);

        return response()->json($wallets);
    }

    /**
     * Display the specified wallet.
     */
    public function show(Wallet $wallet)
    {
        $wallet->load('user');
        return response()->json($wallet);
    }

    /**
     * Get wallet by user ID.
     */
    public function byUser(User $user)
    {
        $wallet = Wallet::where('user_id', $user->id)->firstOrFail();
        return response()->json($wallet);
    }

    /**
     * Approve a wallet (admin only).
     */
    public function approve(Wallet $wallet)
    {
        if ($wallet->approved) {
            return response()->json(['message' => 'Wallet is already approved'], 400);
        }

        $wallet->update(['approved' => true]);

        return response()->json([
            'message' => 'Wallet approved successfully',
            'wallet' => $wallet
        ]);
    }

    /**
     * Lock or unlock a wallet (admin only).
     */
    public function toggleLock(Wallet $wallet)
    {
        $wallet->update(['is_locked' => !$wallet->is_locked]);

        return response()->json([
            'message' => $wallet->is_locked ? 'Wallet locked' : 'Wallet unlocked',
            'wallet' => $wallet
        ]);
    }

    /**
     * Update wallet limits (admin only).
     */
    public function updateLimits(Request $request, Wallet $wallet)
    {
        $validator = Validator::make($request->all(), [
            'daily_withdrawal_limit' => 'nullable|numeric|min:0',
            'monthly_withdrawal_limit' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $wallet->update($validator->validated());

        return response()->json([
            'message' => 'Wallet limits updated successfully',
            'wallet' => $wallet
        ]);
    }

    /**
     * Get wallet balance.
     */
    public function getBalance(Wallet $wallet)
    {
        return response()->json([
            'balance' => $wallet->balance,
            'currency' => $wallet->currency,
            'formatted_balance' => number_format($wallet->balance, 2) . ' ' . $wallet->currency
        ]);
    }

    /**
     * Get withdrawal limits and usage.
     */
    public function getWithdrawalLimits(Wallet $wallet)
    {
        return response()->json([
            'daily_limit' => $wallet->daily_withdrawal_limit,
            'monthly_limit' => $wallet->monthly_withdrawal_limit,
            'used_today' => $wallet->withdrawn_today,
            'used_this_month' => $wallet->withdrawn_this_month,
            'remaining_today' => max(0, $wallet->daily_withdrawal_limit - $wallet->withdrawn_today),
            'remaining_this_month' => max(0, $wallet->monthly_withdrawal_limit - $wallet->withdrawn_this_month),
            'last_withdrawal_at' => $wallet->last_withdrawal_at,
        ]);
    }

    /**
     * Check if withdrawal is allowed.
     */
    public function checkWithdrawalAllowed(Wallet $wallet, Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01'
        ]);

        $amount = $request->amount;

        $checks = [
            'wallet_approved' => $wallet->approved,
            'wallet_not_locked' => !$wallet->is_locked,
            'sufficient_balance' => $wallet->balance >= $amount,
            'daily_limit_not_exceeded' => ($wallet->withdrawn_today + $amount) <= $wallet->daily_withdrawal_limit,
            'monthly_limit_not_exceeded' => ($wallet->withdrawn_this_month + $amount) <= $wallet->monthly_withdrawal_limit,
        ];

        $allowed = !in_array(false, $checks, true);

        return response()->json([
            'allowed' => $allowed,
            'checks' => $checks,
            'current_balance' => $wallet->balance,
            'currency' => $wallet->currency,
        ]);
    }
}
