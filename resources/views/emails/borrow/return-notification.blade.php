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

    {{-- Header band — different styles for overdue vs on-time --}}
    <tr><td style="background:{{ $isOverdue ? 'linear-gradient(135deg,#f97316,#dc2626)' : 'linear-gradient(135deg,#10b981,#059669)' }};padding:32px 40px;text-align:center;">
        <div style="width:56px;height:56px;line-height:56px;background:rgba(255,255,255,0.15);border-radius:16px;text-align:center;margin:0 auto 16px;font-size:28px;">{{ $isOverdue ? '⚠️' : '✅' }}</div>
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">{{ $isOverdue ? 'Book Returned — Overdue' : 'Book Returned Successfully' }}</h1>
        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">{{ now()->format('F d, Y — h:i A') }}</p>
    </td></tr>

    {{-- Greeting --}}
    <tr><td style="padding:32px 40px 0;">
        <p style="margin:0;font-size:15px;color:#374151;">Hi <strong>{{ $record->user?->name }}</strong>,</p>
        @if($isOverdue)
        <p style="margin:12px 0 0;font-size:14px;color:#dc2626;line-height:1.6;">
            Your book has been returned, but it was <strong>returned overdue</strong>. A late penalty has been applied to your account. Please review the details below and settle the penalty at the library counter.
        </p>
        @else
        <p style="margin:12px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
            Thank you for returning your book on time! Your return has been successfully processed. Below are your return details.
        </p>
        @endif
    </td></tr>

    {{-- Book details --}}
    <tr><td style="padding:24px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr>
                @if($record->book?->cover_image)
                <td width="90" style="padding:20px;vertical-align:top;">
                    @if(Str::startsWith($record->book->cover_image, 'http'))
                        <img src="{{ $record->book->cover_image }}" alt="{{ $record->book->title }}" width="70" style="border-radius:6px;border:1px solid #e5e7eb;display:block;">
                    @else
                        <img src="{{ $message->embed(storage_path('app/public/' . $record->book->cover_image)) }}" alt="{{ $record->book->title }}" width="70" style="border-radius:6px;border:1px solid #e5e7eb;display:block;">
                    @endif
                </td>
                @endif
                <td style="padding:20px {{ $record->book?->cover_image ? '20px' : '20px 20px 20px 20px' }};vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">{{ $record->book?->category?->name ?? 'Book' }}</p>
                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827;line-height:1.3;">{{ $record->book?->title ?? 'Unknown Book' }}</p>
                    <p style="margin:0;font-size:13px;color:#6b7280;">Author: {{ $record->book?->author?->name ?? '—' }}</p>
                    <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">Publisher: {{ $record->book?->publisher?->name ?? '—' }}</p>
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
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">{{ $record->user?->profile?->course_description ?? $record->user?->studentProfile?->course_description ?? 'N/A' }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td width="50%">
                            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Borrow Date</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">{{ $record->borrow_date?->format('M d, Y — h:i A') ?? 'N/A' }}</p>
                        </td>
                        <td width="50%">
                            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Original Due Date</p>
                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">{{ $record->due_date?->format('M d, Y — h:i A') ?? 'N/A' }}</p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </td></tr>

    {{-- Penalty notice if overdue --}}
    @if($isOverdue)
    <tr><td style="padding:20px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;">
            <tr><td style="padding-bottom:12px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td>
                            <span style="font-size:18px;">⚠️</span>
                            <span style="margin-left:8px;font-size:14px;font-weight:700;color:#dc2626;vertical-align:middle;">Overdue Penalty Applied</span>
                        </td>
                        <td align="right">
                            <span style="font-size:18px;font-weight:800;color:#dc2626;">₱{{ number_format($penaltyAmount ?? 0, 2) }}</span>
                        </td>
                    </tr>
                </table>
            </td></tr>
            <tr><td style="padding:12px 0;border-top:1px solid #fecaca;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td width="50%" style="padding:4px 0;">
                            <span style="font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Total Penalty</span>
                            <p style="margin:2px 0 0;font-size:15px;font-weight:700;color:#dc2626;">₱{{ number_format($penaltyAmount ?? 0, 2) }}</p>
                        </td>
                        <td width="50%" style="padding:4px 0;">
                            <span style="font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Status</span>
                            <p style="margin:2px 0 0;font-size:15px;font-weight:700;color:#92400e;">Unpaid</p>
                        </td>
                    </tr>
                    @if($penaltyRemarks)
                    <tr><td colspan="2" style="padding:8px 0 0;">
                        <span style="font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;letter-spacing:0.5px;">Details</span>
                        <p style="margin:2px 0 0;font-size:13px;color:#991b1b;">{{ $penaltyRemarks }}</p>
                    </td></tr>
                    @endif
                </table>
            </td></tr>
            <tr><td style="padding:12px 0 0;border-top:1px solid #fecaca;">
                <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.5;">
                    💡 Please proceed to the library counter to settle your penalty. Overdue payments help maintain fair access for all students.
                </p>
            </td></tr>
        </table>
    </td></tr>
    @else
    {{-- On-time return notice --}}
    <tr><td style="padding:20px 40px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;">
            <tr><td>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td>
                            <span style="font-size:18px;">🎉</span>
                            <span style="margin-left:8px;font-size:14px;font-weight:700;color:#166534;vertical-align:middle;">No Penalty — Returned On Time</span>
                        </td>
                        <td align="right">
                            <span style="font-size:11px;font-weight:600;color:#16a34a;background:#dcfce7;padding:4px 10px;border-radius:999px;">✓ All Clear</span>
                        </td>
                    </tr>
                </table>
                <p style="margin:12px 0 0;font-size:13px;color:#166534;line-height:1.5;border-top:1px solid #bbf7d0;padding-top:12px;">
                    Thank you for returning your book on or before the due date. You've also earned <strong>10 Reward Points</strong> for your timely return. Keep up the great habit!
                </p>
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
