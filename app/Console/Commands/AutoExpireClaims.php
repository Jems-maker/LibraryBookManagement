<?php

namespace App\Console\Commands;

use App\Models\BorrowRecord;
use App\Models\BorrowRequest;
use Carbon\Carbon;
use Illuminate\Console\Command;

class AutoExpireClaims extends Command
{
    protected $signature = 'claims:auto-expire';
    protected $description = 'Auto-expire pending claims older than 10 minutes and auto-reject pending requests older than 5 minutes';

    public function handle()
    {
        $autoRejectMins = (int) (\App\Models\Setting::getValue('auto_reject_mins') ?? 5);
        
        // Auto-reject pending requests not acted upon within configured minutes.
        $pendingCutoff = Carbon::now()->subMinutes($autoRejectMins);

        $expiredRequests = BorrowRequest::with(['user', 'book'])
            ->where('status', 'Pending')
            ->where('created_at', '<=', $pendingCutoff)
            ->get();

        $rejectedCount = 0;
        foreach ($expiredRequests as $request) {
            $request->update(['status' => 'Rejected']);

            // If this request was already approved (has a Pending Claim BorrowRecord), expire it too
            $pendingRecord = BorrowRecord::where('borrow_request_id', $request->id)
                ->where('status', 'Pending Claim')
                ->first();

            if ($pendingRecord) {
                // Restore book copy
                $pendingRecord->book->increment('available_copies');
                // Mark record as expired
                $pendingRecord->update(['status' => 'Expired']);
            }

            // Notify the student
            try {
                \Illuminate\Support\Facades\Mail::to($request->user->email)
                    ->queue(new \App\Mail\BorrowRequestRejected($request));
            } catch (\Exception $e) {
                \Log::error('Auto-reject email failed: ' . $e->getMessage());
            }

            $rejectedCount++;
        }

        if ($rejectedCount > 0) {
            $this->info("Auto-rejected {$rejectedCount} pending request(s).");
        }

        $autoExpireMins = (int) (\App\Models\Setting::getValue('auto_expire_mins') ?? 5);

        // Auto-expire pending claims older than configured minutes.
        $cutoff = Carbon::now()->subMinutes($autoExpireMins);

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
                        ->queue(new \App\Mail\BorrowRequestRejected($record->borrowRequest));
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
