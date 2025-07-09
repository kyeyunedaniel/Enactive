<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'balance',
        'currency',
        'approved',
        'is_locked',
        'daily_withdrawal_limit',
        'monthly_withdrawal_limit',
    ];


//     public function getWithdrawnTodayAttribute()
// {
//     return $this->transactions()
//         ->where('transaction_type', 'withdrawal')
//         ->where('status', 'completed')
//         ->whereDate('created_at', today())
//         ->sum('amount');
// }

// public function getWithdrawnThisMonthAttribute()
// {
//     return $this->transactions()
//         ->where('transaction_type', 'withdrawal')
//         ->where('status', 'completed')
//         ->whereMonth('created_at', now()->month)
//         ->whereYear('created_at', now()->year)
//         ->sum('amount');
// }

// public function getLastWithdrawalAtAttribute()
// {
//     return $this->transactions()
//         ->where('transaction_type', 'withdrawal')
//         ->where('status', 'completed')
//         ->latest()
//         ->value('created_at');
// }

public function user()
{
    return $this->belongsTo(User::class, 'user_id', 'id');
}


}
