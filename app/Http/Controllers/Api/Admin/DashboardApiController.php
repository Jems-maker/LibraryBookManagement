<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\BorrowRequest;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardApiController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');
        $cacheKey = "admin_stats_{$period}";

        $data = Cache::remember($cacheKey, 300, function () use ($period) {
            $totalStudents   = User::where('role', 'student')->count();
            $totalBooks      = Book::sum('total_copies');
            $borrowedBooks   = Book::sum('total_copies') - Book::sum('available_copies');
            $pendingRequests = BorrowRequest::where('status', 'Pending')->count();

            $labels    = collect();
            $borrowArr = collect();
            $returnArr = collect();

            if ($period === 'week') {
                for ($i = 6; $i >= 0; $i--) {
                    $date = Carbon::now()->subDays($i);
                    $labels->push($date->format('D'));
                    $dayStart = $date->copy()->startOfDay();
                    $dayEnd   = $date->copy()->endOfDay();

                    $borrowArr->push(
                        BorrowRecord::whereBetween('borrow_date', [$dayStart, $dayEnd])->count()
                    );
                    $returnArr->push(
                        BorrowRecord::whereNotNull('return_date')
                            ->whereBetween('return_date', [$dayStart, $dayEnd])
                            ->count()
                    );
                }
            } else {
                for ($i = 11; $i >= 0; $i--) {
                    $date = Carbon::now()->startOfMonth()->subMonths($i);
                    $labels->push($date->format('M Y'));
                    $borrowArr->push(
                        BorrowRecord::whereYear('borrow_date', $date->year)
                            ->whereMonth('borrow_date', $date->month)
                            ->count()
                    );
                    $returnArr->push(
                        BorrowRecord::whereYear('return_date', $date->year)
                            ->whereMonth('return_date', $date->month)
                            ->whereNotNull('return_date')
                            ->count()
                    );
                }
            }

            $categoryStats = BorrowRecord::selectRaw('books.category_id, count(*) as total')
                ->join('books', 'borrow_records.book_id', '=', 'books.id')
                ->groupBy('books.category_id')
                ->orderByDesc('total')
                ->limit(5)
                ->get()
                ->map(fn ($row) => [
                    'name'  => Category::find($row->category_id)?->name ?? 'Unknown',
                    'total' => $row->total,
                ]);

            return [
                'totalStudents'   => $totalStudents,
                'totalBooks'      => $totalBooks,
                'borrowedBooks'   => $borrowedBooks,
                'pendingRequests' => $pendingRequests,
                'labels'          => $labels->values()->toArray(),
                'borrowArr'       => $borrowArr->values()->toArray(),
                'returnArr'       => $returnArr->values()->toArray(),
                'categoryStats'   => $categoryStats->values()->toArray()
            ];
        });

        return response()->json($data);
    }

    public function notifications(): JsonResponse
    {
        $pendingRequests = BorrowRequest::where('status', 'Pending')->count();
        return response()->json([
            'pendingRequests' => $pendingRequests
        ]);
    }
}