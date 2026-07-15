<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRecord;
use App\Models\RewardPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BorrowRecordApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BorrowRecord::with(['user.profile', 'book.author']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) =>
                $q->where('borrow_id', 'like', "%$s%")
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%$s%")->orWhere('student_id', 'like', "%$s%"))
                  ->orWhereHas('book', fn ($b) => $b->where('title', 'like', "%$s%"))
            );
        }

        $records = $query->latest()->paginate(8)->withQueryString();

        $records->getCollection()->transform(function (BorrowRecord $r) {
            if ($r->book?->cover_image && !str_starts_with($r->book->cover_image, 'http')) {
                $r->book->cover_image = asset('storage/' . $r->book->cover_image);
            }
            return $r;
        });

        return response()->json($records);
    }
}
