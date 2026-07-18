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
                // Send reminder for anything due tomorrow
                \Illuminate\Support\Facades\Mail::to($record->user->email)
                    ->send(new \App\Mail\BookDueReminder($record, 'due_tomorrow'));
                $dueTomorrowCount++;
            }
        }

        // Find books exactly due this minute, including Pending Claim so students get notified at deadline.
        $nowStartString = $now->copy()->startOfMinute()->toDateTimeString();
        $nowEndString = $now->copy()->endOfMinute()->toDateTimeString();
        
        $dueNow = \App\Models\BorrowRecord::with(['user', 'book.author', 'book.category'])
            ->whereIn('status', ['Borrowed', 'Pending Claim'])
            ->whereBetween('due_date', [$nowStartString, $nowEndString])
            ->get();
            
        foreach ($dueNow as $record) {
            \Illuminate\Support\Facades\Mail::to($record->user->email)
                ->send(new \App\Mail\BookDueReminder($record, 'due_now'));
        }

        // 3. Find books that are exactly 20 minutes overdue (grace period)
        $twentyMinsAgoStart = $now->copy()->subMinutes(20)->startOfMinute()->toDateTimeString();
        $twentyMinsAgoEnd = $now->copy()->subMinutes(20)->endOfMinute()->toDateTimeString();

        $overdue = \App\Models\BorrowRecord::with(['user', 'book.author', 'book.category'])
            ->whereIn('status', ['Borrowed', 'Pending Claim'])
            ->whereBetween('due_date', [$twentyMinsAgoStart, $twentyMinsAgoEnd])
            ->get();
            
        foreach ($overdue as $record) {
            // Update status to overdue
            $record->update(['status' => 'Overdue']);
            
            \Illuminate\Support\Facades\Mail::to($record->user->email)
                ->send(new \App\Mail\BookDueReminder($record, 'overdue'));
        }

        // Also catch any old borrowed records that slipped past and mark them overdue without spamming email
        // Just in case the cron skipped a minute
        \App\Models\BorrowRecord::whereIn('status', ['Borrowed', 'Pending Claim'])
            ->where('due_date', '<', $twentyMinsAgoStart)
            ->update(['status' => 'Overdue']);

        $this->info('Reminders sent successfully. ' . $dueTomorrowCount . ' due tomorrow, ' . count($dueNow) . ' due now, ' . count($overdue) . ' overdue.');
    }
}
