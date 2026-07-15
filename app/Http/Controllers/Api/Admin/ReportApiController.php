<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $from = $request->filled('from') ? Carbon::parse($request->from)->startOfDay() : Carbon::now()->startOfMonth();
        $to   = $request->filled('to')   ? Carbon::parse($request->to)->endOfDay()     : Carbon::now()->endOfDay();

        $totalBorrows  = BorrowRecord::whereBetween('borrow_date', [$from, $to])->count();
        $totalReturns  = BorrowRecord::whereBetween('return_date', [$from, $to])->whereNotNull('return_date')->count();
        $overdueCount  = BorrowRecord::where('status', 'Overdue')->count();
        $activeStudents = BorrowRecord::whereBetween('borrow_date', [$from, $to])->distinct('user_id')->count('user_id');

        $topBooks = BorrowRecord::selectRaw('book_id, count(*) as borrows')
            ->with('book.author')
            ->whereBetween('borrow_date', [$from, $to])
            ->groupBy('book_id')
            ->orderByDesc('borrows')
            ->limit(5)
            ->get();

        return response()->json(compact('totalBorrows', 'totalReturns', 'overdueCount', 'activeStudents', 'topBooks', 'from', 'to'));
    }
}
