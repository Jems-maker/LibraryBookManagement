<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\BorrowRequest;

class BorrowRequestSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public BorrowRequest $borrowRequest;

    /**
     * Create a new message instance.
     */
    public function __construct(BorrowRequest $borrowRequest)
    {
        $this->borrowRequest = $borrowRequest->load(['book', 'user']);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Borrow Request Submitted: ' . $this->borrowRequest->book->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.borrow.submitted',
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
