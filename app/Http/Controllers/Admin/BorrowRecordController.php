<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRecord;
use Illuminate\Http\Request;

class BorrowRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = BorrowRecord::with(['user', 'book'])->latest();
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('borrow_id', 'like', "%{$s}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$s}%")
                                                     ->orWhere('student_id', 'like', "%{$s}%"))
                  ->orWhereHas('book', fn($b) => $b->where('title', 'like', "%{$s}%"));
            });
        }
        $records = $query->paginate(10)->withQueryString();
        $status  = $request->status;
        return view('admin.borrow_records.index', compact('records', 'status'));
    }
}
