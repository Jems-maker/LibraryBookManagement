<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
        .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .details { background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #EF4444; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">Borrow Request Rejected</h2>
        </div>
        <div class="content">
            <p>Hello {{ $borrowRequest->user->name }},</p>
            <p>We are sorry to inform you that your request to borrow the following book has been rejected.</p>
            
            <div class="details">
                <p><strong>Book Title:</strong> {{ $borrowRequest->book->title }}</p>
                <p><strong>Author:</strong> {{ $borrowRequest->book->author->name }}</p>
            </div>
            
            <p>This may happen if the book is no longer available, or if there is an issue with your account. If you believe this is a mistake, please contact the librarian.</p>
            
            <p>Thank you for understanding.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Library Management System. All rights reserved.
        </div>
    </div>
</body>
</html>
