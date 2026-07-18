<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\BorrowRecord;

class BookDueReminder extends Mailable
{
    use Queueable, SerializesModels;

    public $record;
    public $type;
    public float $penaltyAmount;

    /**
     * Create a new message instance.
     */
    public function __construct(BorrowRecord $record, $type)
    {
        $this->record = $record;
        $this->type = $type; // 'due_tomorrow' or 'overdue'
        $this->penaltyAmount = (float) \App\Models\Setting::getValue('late_penalty_per_day', 5);
    }

    public function envelope(): Envelope
    {
        $subject = 'Notice';
        if ($this->type === 'overdue') {
            $subject = 'URGENT: Your Library Book is Overdue';
        } elseif ($this->type === 'due_now') {
            $subject = 'ACTION REQUIRED: Your Library Book is Due Now';
        } elseif ($this->type === 'due_tomorrow') {
            $subject = 'Reminder: Your Library Book is Due Tomorrow';
        }
            
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.borrow.reminder',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
