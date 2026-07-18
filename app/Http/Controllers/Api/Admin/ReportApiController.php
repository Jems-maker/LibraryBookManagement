<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\Category;
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
        $categoryId = $request->filled('category_id') ? $request->category_id : null;

        $borrowQuery = BorrowRecord::whereBetween('borrow_date', [$from, $to]);

        if ($categoryId) {
            $borrowQuery->whereHas('book', fn ($q) => $q->where('category_id', $categoryId));
        }

        $totalBorrows  = (clone $borrowQuery)->count();
        $totalReturns  = (clone $borrowQuery)->whereNotNull('return_date')->count();
        $overdueCount  = BorrowRecord::where('status', 'Overdue')->count();
        $activeStudents = (clone $borrowQuery)->distinct('user_id')->count('user_id');

        $topBooksQuery = BorrowRecord::selectRaw('book_id, count(*) as borrows')
            ->with('book.author', 'book.category', 'book.publisher')
            ->whereBetween('borrow_date', [$from, $to])
            ->groupBy('book_id');

        if ($categoryId) {
            $topBooksQuery->whereHas('book', fn ($q) => $q->where('category_id', $categoryId));
        }

        $topBooks = $topBooksQuery->orderByDesc('borrows')->limit(5)->get();

        return response()->json(compact('totalBorrows', 'totalReturns', 'overdueCount', 'activeStudents', 'topBooks', 'from', 'to'));
    }

    public function downloadPdf(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $from = $request->filled('from') ? Carbon::parse($request->from)->startOfDay() : Carbon::now()->startOfMonth();
        $to   = $request->filled('to')   ? Carbon::parse($request->to)->endOfDay()     : Carbon::now()->endOfDay();
        $categoryId = $request->filled('category_id') ? $request->category_id : null;

        $query = BorrowRecord::with(['book.author', 'book.category', 'book.publisher', 'user'])
            ->whereBetween('borrow_date', [$from, $to]);

        if ($categoryId) {
            $query->whereHas('book', fn ($q) => $q->where('category_id', $categoryId));
        }

        $records = $query->orderBy('borrow_date', 'desc')->get();

        $categories = Category::orderBy('name')->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.report', [
            'records'   => $records,
            'from'      => $from->format('M d, Y'),
            'to'        => $to->format('M d, Y'),
            'categories' => $categories,
            'categoryId' => $categoryId,
        ]);

        return $pdf->download('library-report-' . now()->format('Y-m-d') . '.pdf');
    }
}
