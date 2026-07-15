<?php

namespace App\Console\Commands;

use App\Models\BorrowRecord;
use App\Models\BorrowRequest;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AutoExpireClaims extends Command
{
    protected $signature = 'claims:auto-expire';
    protected $description = 'Auto-expire pending claims older than 30 minutes';

    public function handle()
    {
        $cutoff = Carbon::now()->subMinutes(30);

        $expiredRecords = BorrowRecord::with(['user', 'book', 'borrowRequest'])
            ->where('status', 'Pending Claim')
            ->where('borrow_date', '<=', $cutoff)
            ->get();

        $count = 0;
        foreach ($expiredRecords as $record) {
            // Reject the original borrow request
            if ($record->borrowRequest) {
                $record->borrowRequest->update(['status' => 'Rejected']);
            }

            // Restore book copy
            $record->book->increment('available_copies');

            // Mark record as expired
            $record->update(['status' => 'Expired']);

            // Notify the student
            try {
                if ($record->borrowRequest) {
                    \Illuminate\Support\Facades\Mail::to($record->user->email)
                        ->send(new \App\Mail\BorrowRequestRejected($record->borrowRequest));
                }
            } catch (\Exception $e) {
                \Log::error('Auto-expire email failed: ' . $e->getMessage());
            }

            $count++;
        }

        if ($count > 0) {
            $this->info("Expired {$count} unclaimed borrow record(s).");
        }
    }
}