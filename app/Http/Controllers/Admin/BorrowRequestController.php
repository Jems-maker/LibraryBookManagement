<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BorrowRequest;
use App\Models\BorrowRecord;
use Illuminate\Support\Facades\Mail;
use App\Mail\BorrowRequestReceipt;
use App\Mail\BorrowRequestRejected;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BorrowRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = BorrowRequest::with(['user', 'book'])->latest();
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$s}%")
                                                   ->orWhere('email', 'like', "%{$s}%"))
                  ->orWhereHas('book', fn($b) => $b->where('title', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $requests = $query->paginate(10)->withQueryString();
        return view('admin.borrow_requests.index', compact('requests'));
    }

    public function approve(BorrowRequest $borrowRequest)
    {
        if ($borrowRequest->status !== 'Pending') {
            return back()->with('error', 'Only pending requests can be approved.');
        }

        $book = $borrowRequest->book;

        if ($book->available_copies <= 0) {
            return back()->with('error', 'Book is out of stock.');
        }

        // Update Request
        $borrowRequest->update(['status' => 'Approved']);

        // Update Book availability
        $book->decrement('available_copies');

        // Create Borrow Record
        $borrowId = 'BRW-' . strtoupper(Str::random(8));
        
        // Generate QR Code
        $qrContent = config('app.url') . "/admin/scanner?borrow_id=" . $borrowId;
        
        $qrPath = 'qrcodes/' . $borrowId . '.svg';
        
        Storage::disk('public')->put($qrPath, QrCode::size(300)->generate($qrContent));

        $record = BorrowRecord::create([
            'borrow_id' => $borrowId,
            'borrow_request_id' => $borrowRequest->id,
            'user_id' => $borrowRequest->user_id,
            'book_id' => $borrowRequest->book_id,
            'borrow_date' => now(),
            'due_date' => now()->addDays(config('library.borrow_days', 7)),
            'qr_code_path' => $qrPath,
            'status' => 'Pending Claim'
        ]);

        // Send Email
        Mail::to($borrowRequest->user->email)->send(new BorrowRequestReceipt($record));

        return back()->with('success', 'Request approved, QR code generated, and email sent successfully.');
    }

    public function reject(BorrowRequest $borrowRequest)
    {
        if ($borrowRequest->status !== 'Pending') {
            return back()->with('error', 'Only pending requests can be rejected.');
        }

        $borrowRequest->update(['status' => 'Rejected']);

        Mail::to($borrowRequest->user->email)->send(new BorrowRequestRejected($borrowRequest));

        return back()->with('success', 'Request rejected and notification sent.');
    }
}
