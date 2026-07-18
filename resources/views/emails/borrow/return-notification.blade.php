<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Returned Successfully</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="580" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

    {{-- Green header band --}}
    <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:32px 40px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:28px;">✓</span>
        </div>
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Book Returned Successfully</h1>
        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">{{ now()->format('F d, Y — h:i A') }}</p>
    </td></tr>

    {{-- Greeting --}}
    <tr><td style="padding:32px 40px 0;">
        <p style="margin:0;font-size:15px;color:#374151;">Hi <strong>{{ $record->user?->name }}</strong>,</p>
        <p style="margin:12px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
            Thank you for returning your book to the library. Your return has been successfully processed. Below are your return details.
        </p>
    </td></tr>

    {{-- Book details --}}
    <tr><td style="padding:24px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr>
                @if($record->book?->cover_image)
                <td width="90" style="padding:20px;vertical-align:top;">
                    <img src="{{ $message->embed(storage_path('app/public/' . $record->book->cover_image)) }}"
                         alt="{{ $record->book->title }}"
                         width="70"
                         style="border-radius:6px;border:1px solid #e5e7eb;display:block;">
                </td>
                @endif
                <td style="padding:20px {{ $record->book?->cover_image ? '20px' : '20px 20px 20px 20px' }};vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">{{ $record->book?->category?->name ?? 'Book' }}</p>
                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827;line-height:1.3;">{{ $record->book?->title ?? 'Unknown Book' }}</p>
                    <p style="margin:0;font-size:13px;color:#6b7280;">by {{ $record->book?->author?->name ?? '—' }}</p>
                    @if($record->book?->year_of_book)
                    <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">Year: {{ $record->book->year_of_book }}</p>
                    @endif
                </td>
            </tr>
        </table>
    </td></tr>

    {{-- Details grid --}}
    <tr><td style="padding:24px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td width="50%" style="padding-right:10px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
                        <tr><td>
                            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Borrow ID</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;font-family:monospace;">{{ $record->borrow_id }}</p>
                        </td></tr>
                    </table>
                </td>
                <td width="50%" style="padding-left:10px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
                        <tr><td>
                            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Returned On</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">{{ $record->return_date?->format('M d, Y') }}</p>
                            <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">{{ $record->return_date?->format('h:i A') }}</p>
                        </td></tr>
                    </table>
                </td>
            </tr>
            <tr><td colspan="2" style="padding-top:12px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
                    <tr>
                        <td style="padding-bottom:8px;">
                            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Student</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">{{ $record->user?->name ?? 'N/A' }}</p>
                        </td>
                        <td style="padding-bottom:8px;">
                            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Course</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">{{ $record->user?->profile?->course ?? $record->user?->studentProfile?->course ?? 'N/A' }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">
                            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Borrow Date</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">{{ $record->borrow_date?->format('M d, Y') ?? 'N/A' }}</p>
                        </td>
                        <td width="50%">
                            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Original Due Date</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">{{ $record->due_date?->format('M d, Y') ?? 'N/A' }}</p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </td></tr>

    {{-- Penalty notice if applicable --}}
    @php
        $penalty = $record->penalties?->whereIn('reason', ['Overdue Return', 'Overdue Return (Hourly)'])->first();
    @endphp
    @if($penalty)
    <tr><td style="padding:20px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;">
            <tr><td>
                <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#dc2626;">⚠ Overdue Penalty Applied</p>
                <p style="margin:0;font-size:13px;color:#991b1b;">
                    A penalty of <strong>₱{{ number_format($penalty->amount, 2) }}</strong> has been applied for returning {{ $penalty->remarks }}. Please settle this at the library counter.
                </p>
            </td></tr>
        </table>
    </td></tr>
    @else
    <tr><td style="padding:20px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;">
            <tr><td>
                <p style="margin:0;font-size:13px;color:#166534;">✓ No penalty — book returned on time. Thank you!</p>
            </td></tr>
        </table>
    </td></tr>
    @endif

    {{-- Footer --}}
    <tr><td style="padding:32px 40px;text-align:center;border-top:1px solid #f3f4f6;margin-top:24px;">
        <p style="margin:0;font-size:13px;color:#9ca3af;">This is an automated notification from the School Library System.</p>
        <p style="margin:4px 0 0;font-size:12px;color:#d1d5db;">{{ config('app.name') }}</p>
    </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
