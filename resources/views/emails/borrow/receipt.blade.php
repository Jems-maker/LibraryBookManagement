<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Borrow Request Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
                    
                    {{-- Header --}}
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f3f4f6;">
                            <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Library Receipt</h1>
                            <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Request #{{ str_pad($borrowRequest->id, 6, '0', STR_PAD_LEFT) }} &bull; {{ $borrowRequest->status }}</p>
                        </td>
                    </tr>

                    {{-- QR Code --}}
                    <tr>
                        <td style="padding: 40px; text-align: center;">
                            <img src="{{ $qrCodeSvg }}" alt="QR Code" width="160" height="160" style="display: block; margin: 0 auto; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px;">
                            <p style="margin: 16px 0 0; font-size: 13px; color: #6b7280;">Present this QR code at the counter</p>
                        </td>
                    </tr>

                    {{-- Book Details --}}
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px;">Book Details</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    @if($borrowRequest->book->cover_image)
                                    <td width="90" style="vertical-align: top; padding-right: 20px;">
                                        @if(Str::startsWith($borrowRequest->book->cover_image, 'http'))
                                            <img src="{{ $borrowRequest->book->cover_image }}" alt="{{ $borrowRequest->book->title }}" width="90" style="border-radius: 4px; border: 1px solid #e5e7eb; display: block;">
                                        @else
                                            <img src="{{ $message->embed(storage_path('app/public/' . $borrowRequest->book->cover_image)) }}" alt="{{ $borrowRequest->book->title }}" width="90" style="border-radius: 4px; border: 1px solid #e5e7eb; display: block;">
                                        @endif
                                    </td>
                                    @endif
                                    <td style="vertical-align: top;">
                                        <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 600;">{{ $borrowRequest->book->title }}</h3>
                                        <p style="margin: 0 0 2px; font-size: 14px; color: #4b5563;">{{ $borrowRequest->book->author->name }}</p>
                                        <p style="margin: 0; font-size: 13px; color: #6b7280;">Category: {{ $borrowRequest->book->category->name }}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Borrow Details --}}
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px;">Borrow Details</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; width: 140px;">Student Name</td>
                                    <td style="padding: 8px 0; font-weight: 500;">{{ $borrowRequest->user->name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Student ID</td>
                                    <td style="padding: 8px 0; font-weight: 500;">{{ $borrowRequest->user->student_id }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Return Date</td>
                                    <td style="padding: 8px 0; font-weight: 600; color: #111827;">{{ $borrowRequest->return_date ? $borrowRequest->return_date->format('F j, Y') : 'N/A' }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Policy --}}
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #374151;">Library Policy</p>
                            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.6;">
                                Books must be returned by the selected date. A penalty of &#8369;{{ number_format($setting->penalty_amount ?? 5, 2) }}/{{ $setting->penalty_period ?? 'day' }} applies to overdue returns. Lost or damaged books must be replaced or paid in full.
                            </p>
                        </td>
                    </tr>

                </table>
                <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; text-align: center;">This is an automated message. Please do not reply.</p>
            </td>
        </tr>
    </table>
</body>
</html>