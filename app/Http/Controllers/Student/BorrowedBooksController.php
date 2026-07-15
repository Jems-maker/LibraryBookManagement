<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\BorrowRecord;
use Illuminate\Http\Request;

class BorrowedBooksController extends Controller
{
    public function index()
    {
        $records = BorrowRecord::with(['book.author'])
            ->where('user_id', auth()->id())
            ->whereIn('status', ['Pending Claim', 'Borrowed', 'Overdue'])
            ->latest()
            ->get();

        return view('student.borrowed_books', compact('records'));
    }

    public function history()
    {
        $records = BorrowRecord::with(['book.author'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(10);

        return view('student.history', compact('records'));
    }
}
