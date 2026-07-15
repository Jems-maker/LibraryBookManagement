<?php

namespace App\Mail;

use App\Models\BorrowRecord;
use App\Models\BorrowRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BorrowRequestReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public BorrowRequest $borrowRequest;
    public BorrowRecord $record;
    public string $qrCodeSvg;
    public \App\Models\Setting $setting;

    public function __construct(BorrowRecord $record)
    {
        $this->record = $record->load(['book.author', 'book.category', 'user', 'borrowRequest']);
        $this->borrowRequest = $this->record->borrowRequest;
        $this->setting = \App\Models\Setting::firstOrNew([]);

        // QR code for scanning at the counter
        $qrContent = config('app.url') . "/admin/scanner?borrow_id=" . $record->borrow_id;
        $this->qrCodeSvg = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' . urlencode($qrContent);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Library Borrow Request Receipt — ' . $this->borrowRequest->book->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.borrow.receipt',
        );
    }
}
