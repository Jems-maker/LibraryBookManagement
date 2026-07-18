<?php

namespace App\Console\Commands;

use App\Models\BorrowRecord;
use App\Models\BorrowRequest;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AutoExpireClaims extends Command
{
    protected $signature = 'claims:auto-expire';
    protected $description = 'Auto-expire pending claims older than 30 minutes and auto-reject pending requests older than 10 minutes';

    public function handle()
    {
        // Auto-reject pending requests not acted upon within 10 minutes.
        $pendingCutoff = Carbon::now()->subMinutes(10);

        $expiredRequests = BorrowRequest::with(['user', 'book'])
            ->where('status', 'Pending')
            ->where('created_at', '<=', $pendingCutoff)
            ->get();

        $rejectedCount = 0;
        foreach ($expiredRequests as $request) {
            $request->update(['status' => 'Rejected']);

            // Note: No need to restore book copies here because copies are only
            // decremented upon approval, not when the request is submitted.

            // Notify the student
            try {
                \Illuminate\Support\Facades\Mail::to($request->user->email)
                    ->send(new \App\Mail\BorrowRequestRejected($request));
            } catch (\Exception $e) {
                \Log::error('Auto-reject email failed: ' . $e->getMessage());
            }

            $rejectedCount++;
        }

        if ($rejectedCount > 0) {
            $this->info("Auto-rejected {$rejectedCount} pending request(s).");
        }

        // Auto-expire pending claims older than 30 minutes.
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
