<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BorrowRecord;
use App\Models\Penalty;
use App\Mail\BookReturnNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class ScannerController extends Controller
{
    public function index(Request $request)
    {
        $borrowId = $request->query('borrow_id');
        $mode     = $request->query('mode', 'claim'); // 'claim' or 'return'
        $record   = null;

        if ($borrowId) {
            $query = BorrowRecord::with([
                'user.studentProfile',
                'book.author',
                'book.category',
                'book.publisher',
                'penalties',
            ]);

            // Handle legacy JSON QR codes
            $trimmedBorrowId = trim($borrowId);
            if (\Illuminate\Support\Str::startsWith($trimmedBorrowId, '{')) {
                $payload = json_decode($trimmedBorrowId, true);
                if (is_array($payload) && isset($payload['request_id'])) {
                    $record = $query->where('borrow_request_id', $payload['request_id'])->first();
                    
                    if (!$record) {
                        $req = \App\Models\BorrowRequest::find($payload['request_id']);
                        if ($req) {
                            return redirect()->route('admin.scanner.index')
                                ->with('error', "Cannot process: Request #{$req->id} is currently {$req->status}. Only Approved requests have borrow records.");
                        }
                    }
                }
            } else {
                $record = $query->where('borrow_id', $trimmedBorrowId)->first();
            }
        }

        return view('admin.scanner.index', compact('record', 'borrowId', 'mode'));
    }

    public function process(Request $request)
    {
        $request->validate([
            'borrow_id' => 'required|string',
            'action'    => 'required|in:claim,return',
        ]);

        $record = BorrowRecord::with(['user', 'book', 'penalties'])
            ->where('borrow_id', $request->borrow_id)
            ->first();

        if (!$record) {
            return back()->with('error', 'Borrow record not found.');
        }

        // ── Claim ─────────────────────────────────────────────────────
        if ($request->action === 'claim') {
            if ($record->status !== 'Pending Claim') {
                return back()->with('error', 'This record is not pending a claim.');
            }

            $record->update([
                'status'      => 'Borrowed',
                'borrow_date' => now(),
            ]);

            return redirect()->route('admin.scanner.index')
                ->with('success', 'Book successfully claimed by student.');
        }

        // ── Return ─────────────────────────────────────────────────────
        if ($request->action === 'return') {
            // Allow Borrowed, Overdue, AND early returns (status = Borrowed before due date)
            if (!in_array($record->status, ['Borrowed', 'Overdue'])) {
                return back()->with('error', 'This book cannot be returned right now. Status: ' . $record->status);
            }

            $dueDate = Carbon::parse($record->due_date);
            $now     = now();
            
            $gracePeriodDays = (int) (\App\Models\Setting::getValue('penalty_grace_period_days') ?? 0);
            $gracePeriodMins = (int) (\App\Models\Setting::getValue('penalty_grace_period_mins') ?? 5);
            $totalGracePeriodMins = ($gracePeriodDays * 1440) + $gracePeriodMins;

            $isOverdue = $record->status === 'Overdue' || ($now->greaterThan($dueDate) && $now->diffInMinutes($dueDate) > $totalGracePeriodMins);
            $message = 'Book returned successfully.';

            // Penalty only if actually overdue (returned AFTER due date)
            if ($isOverdue) {
                $penaltyAmount = (float) (\App\Models\Setting::getValue('late_penalty_per_day') ?? 10);
                $minutesLate = (int) $now->diffInMinutes($dueDate, false);
                if ($minutesLate <= 0) $minutesLate = 1;

                $daysLate = (int) ceil($minutesLate / 1440);
                $amount   = $daysLate * $penaltyAmount;
                $remarks  = "{$daysLate} day(s) late (₱" . number_format($penaltyAmount, 2) . "/day).";

                Penalty::create([
                    'borrow_record_id' => $record->id,
                    'user_id'          => $record->user_id,
                    'amount'           => $amount,
                    'reason'           => 'Overdue Return',
                    'remarks'          => $remarks,
                    'status'           => 'Unpaid',
                ]);

                $message .= " A penalty of ₱{$amount} has been applied for overdue return.";
            }

            $record->update([
                'status'      => 'Returned',
                'return_date' => $now,
            ]);

            // Award points on return
            \App\Models\RewardPoint::create([
                'user_id' => $record->user_id,
                'points' => 10,
                'reason' => 'Returned a borrowed book',
            ]);

            // Restock the book
            $record->book->increment('available_copies');

            // Send return email notification
            $record->refresh()->load(['user', 'book.author', 'book.category', 'penalties']);

            // Get the latest penalty for this record
            $latestPenalty = $record->penalties()->latest()->first();

            if ($record->user?->email) {
                try {
                    Mail::to($record->user->email)
                        ->send(new BookReturnNotification(
                            $record,
                            $isOverdue,
                            $isOverdue ? ($latestPenalty?->amount ?? null) : null,
                            $isOverdue ? ($latestPenalty?->remarks ?? null) : null,
                        ));
                } catch (\Exception $e) {
                    \Log::warning('Failed to send return notification: ' . $e->getMessage());
                }
            }

            return redirect()->route('admin.scanner.index')
                ->with('success', $message . ' 10 Reward Points awarded!');
        }

        return back()->with('error', 'Invalid action.');
    }
}
