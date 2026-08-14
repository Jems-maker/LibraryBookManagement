<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowRecord;
use App\Models\BorrowRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentApiController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');
        $user->total_points = $user->rewardPoints()->sum('points');
        return response()->json($user);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
        ]);

        $request->user()->update($request->only(['name', 'email']));

        return response()->json($request->user()->fresh()->load('profile'));
    }

    public function updateGender(Request $request): JsonResponse
    {
        $request->validate(['gender' => 'required|in:Male,Female']);
        $user = $request->user();

        if ($user->profile && $user->profile->gender) {
            return response()->json(['message' => 'Gender can only be set once and cannot be changed.'], 422);
        }

        if ($user->profile) {
            $user->profile->update(['gender' => $request->gender]);
        } else {
            $user->profile()->create(['gender' => $request->gender, 'user_id' => $user->id]);
        }

        return response()->json(['message' => 'Gender updated.']);
    }

    public function borrow(Request $request, Book $book): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can borrow books.'], 403);
        }

        if ($book->available_copies <= 0 || $book->status !== 'Available') {
            return response()->json(['message' => 'This book is currently unavailable.'], 422);
        }

        $existing = BorrowRequest::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', 'Pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending request for this book.'], 422);
        }

        $activeRecord = BorrowRecord::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->whereIn('status', ['Pending Claim', 'Borrowed', 'Overdue'])
            ->first();

        if ($activeRecord) {
            return response()->json(['message' => 'You already have an active borrow or claim for this book.'], 422);
        }

        $request->validate([
            'return_date' => ['required', 'date', 'after_or_equal:today'],
            'return_time' => ['required', 'date_format:H:i'],
            'quantity'    => ['required', 'integer', 'min:1', "max:{$book->available_copies}"],
        ]);

        $returnDateTime = Carbon::parse($request->return_date . ' ' . $request->return_time);

        if ($returnDateTime->lte(now())) {
            return response()->json(['message' => 'Return date & time must be in the future.'], 422);
        }

        BorrowRequest::create([
            'user_id'              => $user->id,
            'book_id'              => $book->id,
            'return_date'          => $returnDateTime,
            'status'               => 'Pending',
            'quantity'             => $request->integer('quantity', 1),
        ]);

        // Invalidate admin stats cache so pending count updates
        \Illuminate\Support\Facades\Cache::forget('admin_stats_week');
        \Illuminate\Support\Facades\Cache::forget('admin_stats_month');

        // Notify student
        if ($user->email) {
            try {
                \Illuminate\Support\Facades\Mail::to($user->email)
                    ->queue(new \App\Mail\BorrowRequestSubmitted(
                        BorrowRequest::where('user_id', $user->id)
                            ->where('book_id', $book->id)
                            ->latest()->first()
                    ));
            } catch (\Exception $e) {
                \Log::warning('Email send failed: ' . $e->getMessage());
            }
        }

        return response()->json(['message' => 'Borrow request submitted! Please wait for admin approval.']);
    }

    public function activeBorrows(Request $request): JsonResponse
    {
        $records = BorrowRecord::with(['book.author', 'book.category'])
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['Pending Claim', 'Borrowed', 'Overdue'])
            ->latest()
            ->get()
            ->map(fn ($r) => $this->formatRecord($r));

        return response()->json($records);
    }

    public function history(Request $request): JsonResponse
    {
        $records = BorrowRecord::with(['book.author'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        $records->getCollection()->transform(fn ($r) => $this->formatRecord($r));

        return response()->json($records);
    }

    private function formatRecord(BorrowRecord $r): BorrowRecord
    {
        if ($r->book?->cover_image && !str_starts_with($r->book->cover_image, 'http')) {
            $r->book->cover_image = asset('storage/' . $r->book->cover_image);
        }
        return $r;
    }

    public function requests(Request $request): JsonResponse
    {
        $requests = BorrowRequest::with(['book.author'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        foreach ($requests as $req) {
            if ($req->book?->cover_image && !str_starts_with($req->book->cover_image, 'http')) {
                $req->book->cover_image = asset('storage/' . $req->book->cover_image);
            }
        }

        return response()->json($requests);
    }
}
