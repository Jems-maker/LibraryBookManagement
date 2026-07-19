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
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 12px;"><tr>
            <td style="width: 48px; height: 48px; background: rgba(255,255,255,0.15); border-radius: 14px; text-align: center; vertical-align: middle;">
                <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                    <tr><td style="width: 20px; height: 3px; background: #ffffff; border-radius: 2px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
                </table>
            </td>
            </tr></table>
            <h2 style="margin: 0;">Borrow Request Rejected</h2>
        </div>
        <div class="content">
            <p>Hello {{ $borrowRequest->user->name }},</p>
            <p>We are sorry to inform you that your request to borrow the following book has been rejected.</p>
            
            <div class="details">
                <p><strong>Book Title:</strong> {{ $borrowRequest->book->title }}</p>
                <p><strong>Author:</strong> {{ $borrowRequest->book->author->name }}</p>
                @if($borrowRequest->book->year_of_book)
                <p><strong>Year:</strong> {{ $borrowRequest->book->year_of_book }}</p>
                @endif
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
