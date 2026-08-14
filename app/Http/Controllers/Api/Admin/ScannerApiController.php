<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRecord;
use App\Models\RewardPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ScannerApiController extends Controller
{
    public function lookup(Request $request): JsonResponse
    {
        $borrowId = trim($request->query('borrow_id', ''));

        if (!$borrowId) {
            return response()->json(['record' => null]);
        }

        $query = BorrowRecord::with([
            'user.studentProfile',
            'book.author',
            'book.category',
            'book.publisher',
            'penalties',
            'borrowRequest',
        ]);

        $record = null;
        $error  = null;

        if (Str::startsWith($borrowId, '{')) {
            $payload = json_decode($borrowId, true);
            if (is_array($payload) && isset($payload['request_id'])) {
                $record = $query->where('borrow_request_id', $payload['request_id'])->first();
                if (!$record) {
                    $req = \App\Models\BorrowRequest::find($payload['request_id']);
                    if ($req) {
                        $error = "Cannot process: Request #{$req->id} is currently {$req->status}. Only Approved requests have borrow records.";
                    }
                }
            }
        } else {
            $record = $query->where('borrow_id', $borrowId)->first();
        }

        if ($error) {
            return response()->json(['record' => null, 'error' => $error], 422);
        }

        if (!$record) {
            return response()->json(['record' => null, 'error' => 'No record found for this borrow ID.'], 404);
        }

        // Check if the record is expired (student didn't claim in time)
        if ($record->status === 'Expired') {
            return response()->json([
                'record' => $record,
                'error'  => 'This borrow receipt has expired. The student did not claim the book within the allotted time, and the reservation has been automatically cancelled.',
            ]);
        }

        // Format cover
        if ($record->book?->cover_image && !str_starts_with($record->book->cover_image, 'http')) {
            $record->book->cover_image = asset('storage/' . $record->book->cover_image);
        }

        $settings = [
            'penalty_amount' => (float) (\App\Models\Setting::getValue('late_penalty_per_day') ?? 10),
        ];

        return response()->json(['record' => $record, 'settings' => $settings]);
    }

    public function process(Request $request): JsonResponse
    {
        $request->validate([
            'borrow_id' => 'required|string',
            'action'    => 'required|in:claim,return',
        ]);

        $record = BorrowRecord::with(['user', 'book', 'penalties', 'borrowRequest'])
            ->where('borrow_id', $request->borrow_id)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Borrow record not found.'], 404);
        }

        $now = now();
        $gracePeriodDays = (int) (\App\Models\Setting::getValue('penalty_grace_period_days') ?? 0);
        $gracePeriodMins = (int) (\App\Models\Setting::getValue('penalty_grace_period_mins') ?? 5);
        $totalGracePeriodMins = ($gracePeriodDays * 1440) + $gracePeriodMins;

        if ($request->action === 'claim') {
            if ($record->status === 'Expired') {
                $autoExpireMins = (int) (\App\Models\Setting::getValue('auto_expire_mins') ?? 5);
                return response()->json(['message' => "Cannot claim: This borrow receipt has expired. The student did not claim the book within the {$autoExpireMins}-minute window."], 422);
            }
            if ($record->status !== 'Pending Claim') {
                return response()->json(['message' => 'This book has already been claimed or returned.'], 422);
            }

            $record->update(['status' => 'Borrowed', 'borrow_date' => $now]);

            // Send claim confirmation email
            try {
                \Illuminate\Support\Facades\Mail::to($record->user->email)
                    ->queue(new \App\Mail\BookClaimedNotification($record));
            } catch (\Exception $e) {
                \Log::error('Claim notification email failed: ' . $e->getMessage());
            }

            // Send a due-now or overdue notification at claim time if the due date is already past or very near.
            if ($now->greaterThanOrEqualTo($record->due_date)) {
                try {
                    $isOverdueAtClaim = $now->greaterThan($record->due_date) && $now->diffInMinutes($record->due_date) > $totalGracePeriodMins;
                    \Illuminate\Support\Facades\Mail::to($record->user->email)
                        ->queue(new \App\Mail\BookDueReminder($record, $isOverdueAtClaim ? 'overdue' : 'due_now'));
                    if ($isOverdueAtClaim) {
                        $record->update(['status' => 'Overdue']);
                    }
                } catch (\Exception $e) {
                    \Log::error('Due/overdue notification email failed at claim: ' . $e->getMessage());
                }
            }

            return response()->json(['message' => 'Book successfully claimed by student.']);
        }

        if ($request->action === 'return') {
            if ($record->status === 'Expired') {
                return response()->json(['message' => 'Cannot process: This borrow record has expired and cannot be returned.'], 422);
            }
            if (!in_array($record->status, ['Pending Claim', 'Borrowed', 'Overdue'])) {
                return response()->json(['message' => 'This record cannot be returned.'], 422);
            }

            // Handle Pending Claim → auto-claim on return
            if ($record->status === 'Pending Claim') {
                $record->update(['status' => 'Borrowed', 'borrow_date' => $now]);
            }

            // Determine if overdue BEFORE updating status (original status is needed for accurate check)
            $originalStatus = $record->status;
            $isOverdue = $originalStatus === 'Overdue' || ($now->greaterThan($record->due_date) && $now->diffInMinutes($record->due_date) > $totalGracePeriodMins);
            $penalty   = null;

            if ($isOverdue) {
                $penaltyAmount = (float) (\App\Models\Setting::getValue('late_penalty_per_day') ?? 10);

                // Calculate how many minutes late
                $minutesLate = $now->diffInMinutes($record->due_date, false);
                if ($minutesLate <= 0) $minutesLate = 1;

                $daysLate = (int) ceil($minutesLate / 1440);
                $amount   = $daysLate * $penaltyAmount;
                $remarks  = "{$daysLate} day(s) late (₱" . number_format($penaltyAmount, 2) . "/day).";

                $penalty = \App\Models\Penalty::create([
                    'borrow_record_id' => $record->id,
                    'user_id'          => $record->user_id,
                    'amount'           => $amount,
                    'reason'           => 'Overdue Return',
                    'remarks'          => $remarks,
                    'status'           => 'Unpaid',
                ]);
            }

            // Now update status to Returned (after isOverdue check captured the original state)
            $record->update(['status' => 'Returned', 'return_date' => $now]);

            RewardPoint::create([
                'user_id' => $record->user_id,
                'points'  => 10,
                'reason'  => 'Returned a borrowed book',
            ]);

            $record->book->increment('available_copies');

            try {
                \Illuminate\Support\Facades\Mail::to($record->user->email)
                    ->queue(new \App\Mail\BookReturnNotification(
                        $record,
                        $isOverdue,
                        $penalty?->amount ?? null,
                        $penalty?->remarks ?? null,
                    ));
            } catch (\Exception $e) {
                \Log::error('Return notification email failed: ' . $e->getMessage());
            }

            $msg = $isOverdue
                ? 'Book returned (overdue). Penalty applied. 10 Reward Points awarded!'
                : 'Book returned on time! 10 Reward Points awarded!';

            return response()->json(['message' => $msg]);
        }

        return response()->json(['message' => 'Invalid action.'], 422);
    }
}
