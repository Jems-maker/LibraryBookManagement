<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if (auth()->user()->role === 'admin') {
            $totalStudents   = \App\Models\User::where('role', 'student')->count();
            $totalBooks      = \App\Models\Book::sum('total_copies');
            $borrowedBooks   = \App\Models\Book::sum('total_copies') - \App\Models\Book::sum('available_copies');
            $pendingRequests = \App\Models\BorrowRequest::where('status', 'Pending')->count();

            // ── Monthly borrow activity – last 12 months ──────────────
            $months      = collect();
            $borrowCounts = collect();
            $returnCounts = collect();

            for ($i = 11; $i >= 0; $i--) {
                $date  = Carbon::now()->startOfMonth()->subMonths($i);
                $label = $date->format('M Y');
                $months->push($label);

                $borrowCounts->push(
                    \App\Models\BorrowRecord::whereYear('borrow_date', $date->year)
                        ->whereMonth('borrow_date', $date->month)
                        ->count()
                );
                $returnCounts->push(
                    \App\Models\BorrowRecord::whereYear('return_date', $date->year)
                        ->whereMonth('return_date', $date->month)
                        ->whereNotNull('return_date')
                        ->count()
                );
            }

            // ── Top-5 categories by borrow count ─────────────────────
            $categoryStats = \App\Models\BorrowRecord::select('books.category_id', DB::raw('count(*) as total'))
                ->join('books', 'borrow_records.book_id', '=', 'books.id')
                ->groupBy('books.category_id')
                ->orderByDesc('total')
                ->limit(5)
                ->with('book')
                ->get()
                ->map(function ($row) {
                    $cat = \App\Models\Category::find($row->category_id);
                    return ['name' => $cat?->name ?? 'Unknown', 'total' => $row->total];
                });

            return view('dashboard', compact(
                'totalStudents', 'totalBooks', 'borrowedBooks', 'pendingRequests',
                'months', 'borrowCounts', 'returnCounts', 'categoryStats'
            ));
        }

        // Student Landing Page (Catalog)
        $query = \App\Models\Book::with(['author', 'category'])
            ->withCount(['borrowRecords as total_borrows']);

        $categories = \App\Models\Category::orderBy('name')->get();
        
        // Load active borrows count for the nav
        $activeBorrows = \App\Models\BorrowRecord::where('user_id', auth()->id())
            ->whereIn('status', ['Pending Claim', 'Borrowed'])
            ->count();
        
        if ($request->has('category') && $request->category !== '') {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('author', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('category', function($q3) use ($search) {
                      $q3->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Find the top-borrowed book ID within the current filter scope
        // (used to show the Recommended badge)
        $topBorrowedId = (clone $query)->orderByDesc('total_borrows')->value('id');
        
        $books = $query->latest()->paginate(12)->withQueryString();

        return view('dashboard', compact('books', 'categories', 'activeBorrows', 'topBorrowedId'));
    }

    // ── Auto-suggestion endpoint ──────────────────────────────────────
    public function suggestions(Request $request)
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $books = \App\Models\Book::with('author')
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                      ->orWhereHas('author', fn($a) => $a->where('name', 'like', "%{$q}%"));
            })
            ->limit(8)
            ->get(['id', 'title', 'author_id', 'cover_image'])
            ->map(fn($book) => [
                'label'  => $book->title,
                'author' => $book->author?->name ?? '',
                'cover'  => $book->cover_image ? asset('storage/' . $book->cover_image) : null,
            ]);

        return response()->json($books);
    }
}
