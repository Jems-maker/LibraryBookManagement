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
        $tomorrow = now()->addDay()->toDateString();
        
        // Find books due tomorrow
        $dueTomorrow = \App\Models\BorrowRecord::with(['user', 'book'])
            ->where('status', 'Borrowed')
            ->whereDate('due_date', $tomorrow)
            ->get();
            
        foreach ($dueTomorrow as $record) {
            \Illuminate\Support\Facades\Mail::to($record->user->email)
                ->send(new \App\Mail\BookDueReminder($record, 'due_tomorrow'));
        }

        // Find books that are overdue (status is Borrowed but due date passed)
        $overdue = \App\Models\BorrowRecord::with(['user', 'book'])
            ->where('status', 'Borrowed')
            ->whereDate('due_date', '<', $now->toDateString())
            ->get();
            
        foreach ($overdue as $record) {
            // Update status to overdue
            $record->update(['status' => 'Overdue']);
            
            \Illuminate\Support\Facades\Mail::to($record->user->email)
                ->send(new \App\Mail\BookDueReminder($record, 'overdue'));
        }

        $this->info('Reminders sent successfully. ' . count($dueTomorrow) . ' due tomorrow, ' . count($overdue) . ' overdue.');
    }
}
