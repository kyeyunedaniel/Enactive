<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\WalletTranaction;
use App\Models\PesapalTransaction;
use App\Models\Wallet;
use App\Services\PesapalService;
use Carbon\Carbon;

class SyncWalletTransactions extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'wallet:sync 
                           {--user-id= : Sync transactions for specific user ID}
                           {--wallet-id= : Sync transactions for specific wallet ID}
                           {--transaction-id= : Sync specific transaction ID}
                           {--max-transactions=100 : Maximum number of transactions to process}
                           {--dry-run : Run without making actual changes}
                           {--force : Skip confirmation prompts}
                           {--older-than= : Only sync transactions older than X hours (default: 0)}';

    /**
     * The console command description.
     */
    protected $description = 'Synchronize pending wallet transactions with Pesapal payment status';

    protected $pesapalService;

    public function __construct(PesapalService $pesapalService)
    {
        parent::__construct();
        $this->pesapalService = $pesapalService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Wallet Transaction Sync...');
        $this->newLine();

        $dryRun = $this->option('dry-run');
        $maxTransactions = (int) $this->option('max-transactions');
        $olderThanHours = (int) $this->option('older-than');
        $force = $this->option('force');

        if ($dryRun) {
            $this->warn('🔍 DRY RUN MODE - No changes will be made');
        }

        // Show current stats
        $this->displayCurrentStats();
        
        // Get transactions to process
        $transactions = $this->getTransactionsToProcess($maxTransactions, $olderThanHours);
        
        if ($transactions->isEmpty()) {
            $this->info('✅ No pending transactions found to sync.');
            return self::SUCCESS;
        }

        $this->info("Found {$transactions->count()} pending transactions to check.");
        $this->newLine();

        // Confirm before proceeding (unless forced)
        if (!$force && !$dryRun && !$this->confirm('Do you want to proceed with the sync?')) {
            $this->info('Sync cancelled.');
            return self::SUCCESS;
        }

        // Process transactions
        $results = $this->processTransactions($transactions, $dryRun);

        // Display results
        $this->displayResults($results, $dryRun);

        return self::SUCCESS;
    }

    /**
     * Display current system statistics
     */
    protected function displayCurrentStats()
    {
        $stats = [
            'Pending Wallet Transactions' => WalletTranaction::where('status', 'pending')->count(),
            'Pending Pesapal Transactions' => PesapalTransaction::where('payment_status', 'PENDING')->count(),
            'Transactions Needing Check' => $this->getTransactionsNeedingCheck()->count(),
        ];

        $this->info('📊 Current Statistics:');
        foreach ($stats as $label => $value) {
            $this->line("   {$label}: {$value}");
        }
        $this->newLine();
    }

    /**
     * Get transactions that need checking
     */
    protected function getTransactionsNeedingCheck()
    {
        return WalletTranaction::where('status', 'pending')
            ->whereHas('pesapalTransactions', function($q) {
                $q->where('payment_status', 'PENDING')
                  ->where(function($subQ) {
                      $subQ->whereNull('last_status_check_at')
                           ->orWhere('last_status_check_at', '<=', Carbon::now()->subMinutes(5));
                  });
            });
    }

    /**
     * Get transactions to process based on options
     */
    protected function getTransactionsToProcess(int $maxTransactions, int $olderThanHours)
    {
        $query = WalletTranaction::where('status', 'pending')
            ->with(['wallet.user', 'pesapalTransactions'])
            ->orderBy('created_at', 'asc');

        // Apply filters based on options
        if ($this->option('user-id')) {
            $query->whereHas('wallet', function($q) {
                $q->where('user_id', $this->option('user-id'));
            });
        }

        if ($this->option('wallet-id')) {
            $query->where('wallet_id', $this->option('wallet-id'));
        }

        if ($this->option('transaction-id')) {
            $query->where('id', $this->option('transaction-id'));
        }

        if ($olderThanHours > 0) {
            $query->where('created_at', '<=', Carbon::now()->subHours($olderThanHours));
        }

        return $query->limit($maxTransactions)->get();
    }

    /**
     * Process transactions
     */
    protected function processTransactions($transactions, bool $dryRun): array
    {
        $results = [
            'total_processed' => 0,
            'completed' => 0,
            'failed' => 0,
            'still_pending' => 0,
            'errors' => 0,
            'wallets_updated' => [],
            'error_messages' => []
        ];

        $progressBar = $this->output->createProgressBar($transactions->count());
        $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');
        $progressBar->start();

        foreach ($transactions as $transaction) {
            $progressBar->setMessage("Processing Transaction #{$transaction->id}");
            
            try {
                $result = $this->processSingleTransaction($transaction, $dryRun);
                $results['total_processed']++;

                switch ($result['status']) {
                    case 'completed':
                        $results['completed']++;
                        if ($result['wallet_updated'] ?? false) {
                            $results['wallets_updated'][] = $transaction->wallet_id;
                        }
                        break;
                    case 'failed':
                        $results['failed']++;
                        break;
                    case 'still_pending':
                        $results['still_pending']++;
                        break;
                }

                if (!empty($result['errors'])) {
                    $results['errors']++;
                    $results['error_messages'] = array_merge($results['error_messages'], $result['errors']);
                }

            } catch (\Exception $e) {
                $results['errors']++;
                $results['error_messages'][] = "Transaction {$transaction->id}: " . $e->getMessage();
                Log::error("Command sync error for transaction {$transaction->id}", [
                    'error' => $e->getMessage()
                ]);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $results['wallets_updated'] = array_unique($results['wallets_updated']);
        return $results;
    }

    /**
     * Process a single transaction
     */
    protected function processSingleTransaction(WalletTranaction $walletTransaction, bool $dryRun): array
    {
        $result = [
            'transaction_id' => $walletTransaction->id,
            'status' => 'pending',
            'wallet_updated' => false,
            'errors' => []
        ];

        // Find Pesapal transaction
        $pesapalTransaction = $walletTransaction->pesapalTransactions()->first();
        
        if (!$pesapalTransaction) {
            $result['errors'][] = "No Pesapal transaction found";
            return $result;
        }

        // Check status with Pesapal
        $statusResponse = $this->pesapalService->checkTransactionStatus($pesapalTransaction->order_tracking_id);

        if (!$statusResponse['success']) {
            $result['errors'][] = "Pesapal API error: " . ($statusResponse['message'] ?? 'Unknown error');
            return $result;
        }

        $pesapalStatus = $statusResponse['status'];

        // Process based on status
        if ($pesapalStatus === 'Completed') {
            return $this->handleCompletedTransaction($walletTransaction, $pesapalTransaction, $statusResponse, $result, $dryRun);
        } elseif (in_array($pesapalStatus, ['Failed', 'Cancelled', 'INVALID'])) {
            return $this->handleFailedTransaction($walletTransaction, $pesapalTransaction, $pesapalStatus, $result, $dryRun);
        } else {
            // Still pending
            if (!$dryRun) {
                $pesapalTransaction->update(['last_status_check_at' => now()]);
            }
            $result['status'] = 'still_pending';
        }

        return $result;
    }

    /**
     * Handle completed transaction
     */
    protected function handleCompletedTransaction($walletTransaction, $pesapalTransaction, $statusResponse, $result, $dryRun)
    {
        if (!$dryRun) {
            DB::beginTransaction();
            try {
                // Update Pesapal transaction
                $pesapalTransaction->update([
                    'payment_status' => 'COMPLETED',
                    'payment_completed_at' => now(),
                    'last_status_check_at' => now()
                ]);

                // Update wallet balance
                $wallet = $walletTransaction->wallet;
                $newBalance = $wallet->balance + $walletTransaction->amount;
                $wallet->update(['balance' => $newBalance]);

                // Mark wallet transaction as completed
                $walletTransaction->markAsCompleted($newBalance);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        }

        $result['status'] = 'completed';
        $result['wallet_updated'] = true;
        return $result;
    }

    /**
     * Handle failed transaction
     */
    protected function handleFailedTransaction($walletTransaction, $pesapalTransaction, $pesapalStatus, $result, $dryRun)
    {
        if (!$dryRun) {
            DB::beginTransaction();
            try {
                $pesapalTransaction->update([
                    'payment_status' => 'FAILED',
                    'last_status_check_at' => now(),
                    'error_message' => "Payment {$pesapalStatus} via Pesapal"
                ]);

                $walletTransaction->markAsFailed("Payment {$pesapalStatus} via Pesapal");

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        }

        $result['status'] = 'failed';
        return $result;
    }

    /**
     * Display final results
     */
    protected function displayResults(array $results, bool $dryRun)
    {
        $this->newLine();
        
        if ($dryRun) {
            $this->info('🔍 DRY RUN RESULTS:');
        } else {
            $this->info('✅ SYNC COMPLETED:');
        }
        
        $this->line("   Total Processed: {$results['total_processed']}");
        $this->line("   Completed: {$results['completed']}");
        $this->line("   Failed: {$results['failed']}");
        $this->line("   Still Pending: {$results['still_pending']}");
        $this->line("   Wallets Updated: " . count($results['wallets_updated']));
        
        if ($results['errors'] > 0) {
            $this->warn("   Errors: {$results['errors']}");
            
            if ($this->option('verbose')) {
                $this->newLine();
                $this->error('Error Details:');
                foreach ($results['error_messages'] as $error) {
                    $this->line("   • {$error}");
                }
            }
        }

        if ($dryRun && ($results['completed'] > 0 || $results['failed'] > 0)) {
            $this->newLine();
            $this->comment('Run without --dry-run to apply these changes.');
        }
    }
}