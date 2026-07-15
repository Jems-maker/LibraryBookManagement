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

    /**
     * Create a new message instance.
     */
    public function __construct(BorrowRecord $record, $type)
    {
        $this->record = $record;
        $this->type = $type; // 'due_tomorrow' or 'overdue'
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->type === 'overdue' 
            ? 'URGENT: Your Library Book is Overdue' 
            : 'Reminder: Your Library Book is Due Tomorrow';
            
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
