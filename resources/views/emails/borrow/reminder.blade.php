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
            <h2 style="margin: 0;">
                {{ $type === 'overdue' ? 'Book Overdue Notice' : 'Book Due Tomorrow' }}
            </h2>
        </div>
        <div class="content">
            <p>Hello {{ $record->user->name }},</p>
            
            @if($type === 'overdue')
                <p>This is an urgent notice that the following book is now <strong>OVERDUE</strong>.</p>
                <p>Please return it to the library immediately. A penalty of 10 currency per day will be applied until the book is returned.</p>
            @else
                <p>This is a friendly reminder that the following book is due <strong>tomorrow</strong>.</p>
                <p>Please return it to the library by the due date to avoid any late penalties.</p>
            @endif
            
            <div class="details">
                <p><strong>Book Title:</strong> {{ $record->book->title }}</p>
                <p><strong>Borrow ID:</strong> {{ $record->borrow_id }}</p>
                <p><strong>Due Date:</strong> {{ \Carbon\Carbon::parse($record->due_date)->format('M d, Y') }}</p>
            </div>
            
            <p>Thank you for using our Library System!</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Library Management System. All rights reserved.
        </div>
    </div>
</body>
</html>
