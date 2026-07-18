<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { 
            color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; 
            background-color: {{ $type === 'overdue' ? '#EF4444' : '#F59E0B' }};
        }
        .content { padding: 20px; }
        .details { 
            background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; 
            border-left: 4px solid {{ $type === 'overdue' ? '#EF4444' : '#F59E0B' }}; 
        }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 12px;"><tr>
            <td style="width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 14px; text-align: center; vertical-align: middle;">
                <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                    <tr><td style="width: 3px; height: 14px; background: #ffffff; border-radius: 2px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                    <tr><td style="height: 4px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                    <tr><td style="width: 3px; height: 3px; background: #ffffff; border-radius: 50%; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                </table>
            </td>
            </tr></table>
            <h2 style="margin: 0;">
                @if($type === 'overdue')
                    Book Overdue Notice
                @elseif($type === 'due_now')
                    Book Due Now
                @else
                    Book Due Tomorrow
                @endif
            </h2>
        </div>
        <div class="content">
            <p>Hello {{ $record->user->name }},</p>
            
            @if($type === 'overdue')
                <p>This is an urgent notice that the following book is now <strong>OVERDUE</strong>.</p>
                <p>Please return it to the library immediately. A penalty of &#8369;{{ number_format($penaltyAmount, 2) }} per 24 hours overdue will be applied until the book is returned.</p>
            @elseif($type === 'due_now')
                <p>This is a notice that your scheduled time to return the following book has <strong>arrived</strong>.</p>
                <p>Please return it to the library immediately. A penalty of &#8369;{{ number_format($penaltyAmount, 2) }} per 24 hours overdue will be applied if not returned.</p>
            @else
                <p>This is a friendly reminder that the following book is due <strong>tomorrow</strong>.</p>
                <p>Please return it to the library by the due date to avoid any late penalties.</p>
            @endif
            
            <div class="details">
                <p><strong>Borrow ID:</strong> {{ $record->borrow_id }}</p>
                <p><strong>Book Title:</strong> {{ $record->book->title }}</p>
                <p><strong>Author:</strong> {{ $record->book->author?->name ?? 'N/A' }}</p>
                <p><strong>Category:</strong> {{ $record->book->category?->name ?? 'N/A' }}</p>
                @if($record->book->year_of_book)
                <p><strong>Year:</strong> {{ $record->book->year_of_book }}</p>
                @endif
                <p><strong>Course:</strong> {{ $record->user->profile?->course ?? $record->user->studentProfile?->course ?? 'N/A' }}</p>
                <p><strong>Due Date:</strong> <span style="color: {{ $type === 'overdue' ? '#EF4444' : '#F59E0B' }}; font-weight: bold;">{{ \Carbon\Carbon::parse($record->due_date)->format('M d, Y h:i A') }}</span></p>
            </div>
            
            <p>Thank you for using our Library System!</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Library Management System. All rights reserved.
        </div>
    </div>
</body>
</html>
