<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\BorrowRecord;

class BookReturnNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public BorrowRecord $record) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Book Returned Successfully — ' . $this->record->book?->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.borrow.return-notification',
        );
    }

    public function attachments(): array { return []; }
}
