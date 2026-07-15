<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Mail\BorrowRequestReceipt;
use App\Models\Book;
use App\Models\BorrowRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\BorrowRequestSubmitted;

class BorrowRequestController extends Controller
{
    public function store(Request $request, Book $book)
    {
        if (auth()->user()->role !== 'student') {
            return back()->with('error', 'Only students can borrow books.');
        }

        if ($book->available_copies <= 0 || $book->status !== 'Available') {
            return back()->with('error', 'This book is currently unavailable.');
        }

        // Check if student already has a pending or approved request for this book
        $existingRequest = BorrowRequest::where('user_id', auth()->id())
            ->where('book_id', $book->id)
            ->whereIn('status', ['Pending', 'Approved'])
            ->first();

        if ($existingRequest) {
            return back()->with('error', 'You already have an active request for this book.');
        }

        $request->validate([
            'return_date'          => ['required', 'date', 'after:now'],
            'quantity'             => ['nullable', 'integer', 'min:1', 'max:' . $book->available_copies],
            'borrow_duration_hours'=> ['nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $quantity   = (int) $request->get('quantity', 1);
        $returnDate = Carbon::parse($request->return_date);
        $borrowDays = $request->filled('borrow_duration_hours') ? null : now()->startOfDay()->diffInDays($returnDate);
        $borrowHours = $request->filled('borrow_duration_hours') ? (int) $request->borrow_duration_hours : null;

        $borrowRequest = BorrowRequest::create([
            'user_id'              => auth()->id(),
            'book_id'              => $book->id,
            'borrow_duration_days' => $borrowDays,
            'borrow_duration_hours'=> $borrowHours,
            'return_date'          => $returnDate,
            'status'               => 'Pending',
            'quantity'             => $quantity,
        ]);
        // Send email receipt if student has an email address
        $user = auth()->user();
        if ($user->email) {
            try {
                Mail::to($user->email)->send(new BorrowRequestSubmitted($borrowRequest));
            } catch (\Exception $e) {
                // Log the error but don't block the request
                \Log::warning('Failed to send borrow request submitted email: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Borrow request submitted! Please wait for admin approval.');
    }
}
