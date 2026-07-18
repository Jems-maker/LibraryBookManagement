
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Claimed Successfully</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">

                    {{-- Logo & Header --}}
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #f3f4f6;">
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px;"><tr>
                            <td style="width: 52px; height: 52px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 14px; text-align: center; vertical-align: middle;">
                                <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                                    <tr><td style="width: 14px; height: 14px; background: #ffffff; border-radius: 50%; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                                </table>
                            </td>
                            </tr></table>
                            <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px; color: #059669;">Book Successfully Claimed</h1>
                            <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Borrow ID: {{ $record->borrow_id }}</p>
                        </td>
                    </tr>

                    {{-- Reminder --}}
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f0fdf4; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
                                You have successfully claimed your book. Please keep the <strong>Library Receipt</strong> sent to you upon approval and present it when returning the book.
                            </p>
                        </td>
                    </tr>

                    {{-- Book Details --}}
                    <tr>
                        <td style="padding: 30px 40px;">
                            <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px;">Book Details</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    @if($record->book?->cover_image)
                                    <td width="90" style="vertical-align: top; padding-right: 20px;">
                                        @if(Str::startsWith($record->book->cover_image, 'http'))
                                            <img src="{{ $record->book->cover_image }}" alt="{{ $record->book->title }}" width="90" style="border-radius: 4px; border: 1px solid #e5e7eb; display: block;">
                                        @else
                                            <img src="{{ $message->embed(storage_path('app/public/' . $record->book->cover_image)) }}" alt="{{ $record->book->title }}" width="90" style="border-radius: 4px; border: 1px solid #e5e7eb; display: block;">
                                        @endif
                                    </td>
                                    @endif
                                    <td style="vertical-align: top;">
                                        <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 600;">{{ $record->book->title }}</h3>
                                        <p style="margin: 0 0 2px; font-size: 14px; color: #4b5563;">{{ $record->book->author->name ?? '' }}</p>
                                        <p style="margin: 0; font-size: 13px; color: #6b7280;">Category: {{ $record->book->category->name ?? '' }}</p>
                                        @if($record->book->year_of_book)
                                        <p style="margin: 2px 0 0; font-size: 13px; color: #6b7280;">Year: {{ $record->book->year_of_book }}</p>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Borrow Details --}}
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px;">Borrow Details</h2>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; width: 140px;">Student Name</td>
                                    <td style="padding: 8px 0; font-weight: 500;">{{ $record->user->name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Student ID</td>
                                    <td style="padding: 8px 0; font-weight: 500;">{{ $record->user->student_id }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Course</td>
                                    <td style="padding: 8px 0; font-weight: 500;">{{ $record->user->profile?->course ?? $record->user->studentProfile?->course ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Due Date</td>
                                    <td style="padding: 8px 0; font-weight: 600; color: #111827;">{{ $record->due_date ? $record->due_date->format('F j, Y — h:i A') : 'N/A' }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Policy --}}
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #374151;">Library Policy</p>
                            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.6;">
                                Books must be returned by the due date. A penalty applies to overdue returns. Lost or damaged books must be replaced or paid in full.
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