<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\BorrowRecord;
use App\Models\RewardPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BorrowRequestApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BorrowRequest::with(['user.profile', 'book.author', 'book.category', 'book.publisher']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) =>
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%$s%")->orWhere('student_id', 'like', "%$s%"))
                  ->orWhereHas('book', fn ($b) => $b->where('title', 'like', "%$s%"))
            );
        }

        return response()->json($query->latest()->paginate(8)->withQueryString());
    }

    public function approve(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        if ($borrowRequest->status !== 'Pending') {
            return response()->json(['message' => 'Request is not pending.'], 422);
        }

        $book = $borrowRequest->book;
        if ($book->available_copies <= 0) {
            return response()->json(['message' => 'Book is out of stock.'], 422);
        }

        try {
            DB::beginTransaction();

            $borrowRequest->update(['status' => 'Approved']);
            $book->decrement('available_copies');

            $borrowId = 'BRW-' . strtoupper(Str::random(8));
            $qrContent = config('app.url') . "/admin/scanner?borrow_id=" . $borrowId;
            $qrPath = 'qrcodes/' . $borrowId . '.svg';
            Storage::disk('public')->put($qrPath, QrCode::size(300)->generate($qrContent));

            $record = BorrowRecord::create([
                'borrow_id'         => $borrowId,
                'borrow_request_id' => $borrowRequest->id,
                'user_id'           => $borrowRequest->user_id,
                'book_id'           => $borrowRequest->book_id,
                'borrow_date'       => now(),
                'due_date'          => $borrowRequest->return_date ?? now()->addDays(config('library.borrow_days', 7)),
                'qr_code_path'      => $qrPath,
                'status'            => 'Pending Claim',
            ]);

            DB::commit();

            try {
                Mail::to($borrowRequest->user->email)->queue(new \App\Mail\BorrowRequestReceipt($record));
            } catch (\Exception $e) {
                \Log::warning('Email failed: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Request approved and QR sent.', 'record' => $record]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Approve failed: ' . $e->getMessage());
            return response()->json(['message' => 'Approval failed. Please try again.'], 500);
        }
    }

    public function reject(Request $request, BorrowRequest $borrowRequest): JsonResponse
    {
        if ($borrowRequest->status !== 'Pending') {
            return response()->json(['message' => 'Request is not pending.'], 422);
        }

        $borrowRequest->update(['status' => 'Rejected']);

        try {
            Mail::to($borrowRequest->user->email)->queue(new \App\Mail\BorrowRequestRejected($borrowRequest));
        } catch (\Exception $e) {
            \Log::error('Rejection email failed: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Request rejected.']);
    }
}