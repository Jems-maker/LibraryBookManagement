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

    public function __construct(
        public BorrowRecord $record,
        public bool $isOverdue = false,
        public ?float $penaltyAmount = null,
        public ?string $penaltyRemarks = null,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->isOverdue
            ? '⚠ Book Returned (Overdue) — ' . $this->record->book?->title
            : '✅ Book Returned Successfully — ' . $this->record->book?->title;

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.borrow.return-notification',
            with: [
                'isOverdue'       => $this->isOverdue,
                'penaltyAmount'   => $this->penaltyAmount,
                'penaltyRemarks'  => $this->penaltyRemarks,
            ],
        );
    }

    public function attachments(): array { return []; }
}
