<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Penalty;
use App\Models\BorrowRecord;
use App\Models\Book;
use App\Models\Category;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        // ── Penalty stats ─────────────────────────────────────────────
        $totalPenaltiesAmount  = Penalty::sum('amount');
        $unpaidPenaltiesAmount = Penalty::where('status', 'Unpaid')->sum('amount');
        $paidPenaltiesAmount   = Penalty::where('status', 'Paid')->sum('amount');

        // ── Borrow stats ──────────────────────────────────────────────
        $totalBorrows   = BorrowRecord::count();
        $overdueBorrows = BorrowRecord::where('status', 'Overdue')->count();

        // ── Most borrowed books ───────────────────────────────────────
        $popularBooks = BorrowRecord::select('book_id', DB::raw('count(*) as total'))
            ->groupBy('book_id')
            ->orderByDesc('total')
            ->limit(5)
            ->with('book')
            ->get();

        // ── Recent penalties ──────────────────────────────────────────
        $recentPenalties = Penalty::with(['user', 'borrowRecord.book'])
            ->latest()
            ->limit(10)
            ->get();

        // ── Monthly borrow + return counts – last 12 months ──────────
        $months       = collect();
        $borrowCounts = collect();
        $returnCounts = collect();

        for ($i = 11; $i >= 0; $i--) {
            $date  = Carbon::now()->startOfMonth()->subMonths($i);
            $months->push($date->format('M Y'));

            $borrowCounts->push(
                BorrowRecord::whereYear('borrow_date', $date->year)
                    ->whereMonth('borrow_date', $date->month)
                    ->count()
            );
            $returnCounts->push(
                BorrowRecord::whereYear('return_date', $date->year)
                    ->whereMonth('return_date', $date->month)
                    ->whereNotNull('return_date')
                    ->count()
            );
        }

        // ── Borrows by category (bar chart) ───────────────────────────
        $categoryStats = BorrowRecord::select('books.category_id', DB::raw('count(*) as total'))
            ->join('books', 'borrow_records.book_id', '=', 'books.id')
            ->groupBy('books.category_id')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(function ($row) {
                $cat = Category::find($row->category_id);
                return ['name' => $cat?->name ?? 'Unknown', 'total' => $row->total];
            });

        // ── Penalty collected per month (last 6) ──────────────────────
        $penaltyMonths     = collect();
        $penaltyCollected  = collect();

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->startOfMonth()->subMonths($i);
            $penaltyMonths->push($date->format('M Y'));
            $penaltyCollected->push(
                Penalty::where('status', 'Paid')
                    ->whereYear('updated_at', $date->year)
                    ->whereMonth('updated_at', $date->month)
                    ->sum('amount')
            );
        }

        return view('admin.reports.index', compact(
            'totalPenaltiesAmount', 'unpaidPenaltiesAmount', 'paidPenaltiesAmount',
            'totalBorrows', 'overdueBorrows',
            'popularBooks', 'recentPenalties',
            'months', 'borrowCounts', 'returnCounts',
            'categoryStats', 'penaltyMonths', 'penaltyCollected'
        ));
    }
}
