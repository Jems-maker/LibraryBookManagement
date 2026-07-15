<?php

namespace App\Mail;

use App\Models\BorrowRecord;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookClaimedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public BorrowRecord $record;

    public function __construct(BorrowRecord $record)
    {
        $this->record = $record->load(['book.author', 'book.category', 'user', 'borrowRequest']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Book Claimed Successfully — ' . $this->record->book?->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.borrow.claimed',
        );
    }

    public function attachments(): array { return []; }
}