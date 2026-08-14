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
        .icon-circle {
            display: inline-block; width: 48px; height: 48px; line-height: 48px;
            background: rgba(255,255,255,0.15); border-radius: 14px;
            font-size: 24px; text-align: center; margin-bottom: 12px;
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
            <div class="icon-circle">{{ $type === 'overdue' ? '⛔' : '⚠️' }}</div>
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
                <p>Please return it to the library <strong>immediately</strong>. If not returned within <strong>5 minutes</strong> from the due time, the system will automatically apply an overdue penalty of &#8369;{{ number_format($penaltyAmount, 2) }} per 24 hours. <span style="color: #DC2626; font-weight: bold;">You have a 5-minute grace period to return the book before penalties kick in.</span></p>
            @else
                <p>This is a friendly reminder that the following book is due <strong>tomorrow</strong>.</p>
                <p>Please return it to the library by the due date to avoid any late penalties. <strong>Note:</strong> If not returned within 5 minutes after the due time, a penalty of &#8369;{{ number_format($penaltyAmount, 2) }} per 24 hours will be <strong>automatically applied</strong>.</p>
            @endif
            
            <div class="details">
                @if($record->book?->cover_image)
                <div style="text-align: center; margin-bottom: 16px;">
                    @if(Str::startsWith($record->book->cover_image, 'http'))
                        <img src="{{ $record->book->cover_image }}" alt="{{ $record->book->title }}" width="120" style="border-radius: 6px; border: 1px solid #e5e7eb; display: inline-block;">
                    @else
                        <img src="{{ $message->embed(storage_path('app/public/' . $record->book->cover_image)) }}" alt="{{ $record->book->title }}" width="120" style="border-radius: 6px; border: 1px solid #e5e7eb; display: inline-block;">
                    @endif
                </div>
                @endif
                <p><strong>Borrow ID:</strong> {{ $record->borrow_id }}</p>
                <p><strong>Book Title:</strong> {{ $record->book->title }}</p>
                <p><strong>Author:</strong> {{ $record->book->author?->name ?? 'N/A' }}</p>
                <p><strong>Publisher:</strong> {{ $record->book->publisher?->name ?? 'N/A' }}</p>
                <p><strong>Category:</strong> {{ $record->book->category?->name ?? 'N/A' }}</p>
                @if($record->book->year_of_book)
                <p><strong>Year:</strong> {{ $record->book->year_of_book }}</p>
                @endif
                <p><strong>Course:</strong> {{ $record->user->profile?->course_description ?? $record->user->studentProfile?->course_description ?? 'N/A' }}</p>
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
