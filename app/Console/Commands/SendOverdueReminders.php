<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendOverdueReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'library:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send email reminders for books that are due soon or overdue.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now();
        $tomorrow = $now->copy()->addDay()->toDateString();
        
        // 1. Find books due tomorrow (Only run this check exactly at 08:00)
        $dueTomorrowCount = 0;
        if ($now->format('H:i') === '08:00') {
            $dueTomorrow = \App\Models\BorrowRecord::with(['user', 'book.author', 'book.category', 'borrowRequest'])
                ->where('status', 'Borrowed')
                ->whereDate('due_date', $tomorrow)
                ->get();
                
            foreach ($dueTomorrow as $record) {
                \Illuminate\Support\Facades\Mail::to($record->user->email)
                    ->queue(new \App\Mail\BookDueReminder($record, 'due_tomorrow'));
                $dueTomorrowCount++;
            }
        }

        // 2. Due-date notice — send at exact due time (once only, using flag)
        $dueNow = \App\Models\BorrowRecord::with(['user', 'book.author', 'book.category'])
            ->where('status', 'Borrowed')
            ->where('due_date', '<=', $now)
            ->whereNull('due_reminder_sent_at')
            ->get();
            
        foreach ($dueNow as $record) {
            try {
                \Illuminate\Support\Facades\Mail::to($record->user->email)
                    ->queue(new \App\Mail\BookDueReminder($record, 'due_now'));
            } catch (\Exception $e) {
                \Log::error('Due-now email failed: ' . $e->getMessage());
            }
            $record->update(['due_reminder_sent_at' => $now]);
        }

        // 3. Overdue notice — send after configured grace period (once only, using flag)
        $gracePeriodDays = (int) (\App\Models\Setting::getValue('penalty_grace_period_days') ?? 0);
        $gracePeriodMins = (int) (\App\Models\Setting::getValue('penalty_grace_period_mins') ?? 5);
        $totalGracePeriodMins = ($gracePeriodDays * 1440) + $gracePeriodMins;

        $overdueCutoff = $now->copy()->subMinutes($totalGracePeriodMins);

        $overdue = \App\Models\BorrowRecord::with(['user', 'book.author', 'book.category'])
            ->where('status', 'Borrowed')
            ->where('due_date', '<=', $overdueCutoff)
            ->whereNull('overdue_reminder_sent_at')
            ->get();
            
        foreach ($overdue as $record) {
            $record->update([
                'status' => 'Overdue',
                'overdue_reminder_sent_at' => $now,
            ]);
            
            try {
                \Illuminate\Support\Facades\Mail::to($record->user->email)
                    ->queue(new \App\Mail\BookDueReminder($record, 'overdue'));
            } catch (\Exception $e) {
                \Log::error('Overdue email failed: ' . $e->getMessage());
            }
        }

        // Also catch any old borrowed records that slipped past and mark them overdue
        \App\Models\BorrowRecord::where('status', 'Borrowed')
            ->where('due_date', '<=', $overdueCutoff)
            ->update(['status' => 'Overdue']);

        $this->info('Reminders sent successfully. ' . $dueTomorrowCount . ' due tomorrow, ' . count($dueNow) . ' due now, ' . count($overdue) . ' overdue.');
    }
}
