<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BookApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Book::with(['author', 'category'])
            ->withCount(['borrowRecords as total_borrows']);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhereHas('author', fn ($q2) => $q2->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('category', fn ($q3) => $q3->where('name', 'like', "%{$s}%"));
            });
        }

        $topBorrowedId = (clone $query)->orderByDesc('total_borrows')->value('id');

        $books = $query->latest()->paginate(12)->withQueryString();

        // Mark recommended
        $books->getCollection()->transform(function (Book $book) use ($topBorrowedId) {
            $book->is_recommended = $book->id === $topBorrowedId;
            if ($book->cover_image && !str_starts_with($book->cover_image, 'http')) {
                $book->cover_image = asset('storage/' . $book->cover_image);
            }
            return $book;
        });

        return response()->json($books);
    }

    public function show(Book $book): JsonResponse
    {
        $book->load(['author', 'category', 'publisher']);
        if ($book->cover_image && !str_starts_with($book->cover_image, 'http')) {
            $book->cover_image = asset('storage/' . $book->cover_image);
        }
        return response()->json($book);
    }

    public function categories(): JsonResponse
    {
        return response()->json(Category::orderBy('name')->get());
    }

    public function suggestions(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));
        $categorySlug = $request->get('category', '');

        if (strlen($q) < 2 && !$categorySlug) {
            return response()->json([]);
        }

        $query = Book::with('author');

        if ($categorySlug) {
            $query->whereHas('category', fn ($c) => $c->where('slug', $categorySlug));
        }

        if ($q) {
            $query->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                      ->orWhereHas('author', fn ($a) => $a->where('name', 'like', "%{$q}%"))
                      ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$q}%"));
            });
        }

        $books = $query->limit(8)->get(['id', 'title', 'author_id', 'cover_image'])
            ->map(fn ($book) => [
                'id'     => $book->id,
                'label'  => $book->title,
                'author' => $book->author?->name ?? '',
                'cover'  => $book->cover_image
                    ? (str_starts_with($book->cover_image, 'http')
                        ? $book->cover_image
                        : asset('storage/' . $book->cover_image))
                    : null,
            ]);

        // Also find matching categories
        $categories = [];
        if (strlen($q) >= 2) {
            $categories = Category::where('name', 'like', "%{$q}%")
                ->limit(4)
                ->get(['id', 'name', 'slug'])
                ->toArray();
        }

        return response()->json([
            'books'      => $books,
            'categories' => $categories,
        ]);
    }
}
