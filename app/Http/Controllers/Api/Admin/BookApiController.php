<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Author;
use App\Models\Category;
use App\Models\Publisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Book::with(['author', 'category', 'publisher'])
            ->withCount(['borrowRecords as total_borrows']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) =>
                $q->where('title', 'like', "%$s%")
                  ->orWhere('book_id', 'like', "%$s%")
                  ->orWhereHas('author', fn ($a) => $a->where('name', 'like', "%$s%"))
            );
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $books = $query->latest()->paginate(8)->withQueryString();

        $books->getCollection()->transform(function (Book $book) {
            if ($book->cover_image && !str_starts_with($book->cover_image, 'http')) {
                $book->cover_image = asset('storage/' . $book->cover_image);
            }
            return $book;
        });

        return response()->json($books);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'author_id'        => 'required|exists:authors,id',
            'category_id'      => 'required|exists:categories,id',
            'publisher_id'     => 'nullable|exists:publishers,id',
            'total_copies'     => 'required|integer|min:1',
            'status'           => 'required|in:Available,Unavailable',
            'cover_image'      => 'nullable|image|max:2048',
            'year_of_book'     => 'nullable|integer',
        ]);

        // Auto-set available_copies to total_copies on creation
        $data['available_copies'] = $data['total_copies'];

        // Auto-generate book_id
        $data['book_id'] = 'BK-' . strtoupper(\Illuminate\Support\Str::random(6));

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('book_covers', 'public');
        }

        $book = Book::create($data);
        return response()->json($book->load(['author', 'category', 'publisher']), 201);
    }

    public function show(Book $book): JsonResponse
    {
        $book->load(['author', 'category', 'publisher']);
        if ($book->cover_image && !str_starts_with($book->cover_image, 'http')) {
            $book->cover_image = asset('storage/' . $book->cover_image);
        }
        return response()->json($book);
    }

    public function update(Request $request, Book $book): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'description'      => 'nullable|string',
            'author_id'        => 'sometimes|exists:authors,id',
            'category_id'      => 'sometimes|exists:categories,id',
            'publisher_id'     => 'nullable|exists:publishers,id',
            'total_copies'     => 'sometimes|integer|min:1',
            'available_copies' => 'sometimes|integer|min:0',
            'status'           => 'sometimes|in:Available,Unavailable',
            'cover_image'      => 'nullable|image|max:2048',
            'year_of_book'     => 'nullable|integer',
        ]);

        if ($request->hasFile('cover_image')) {
            if ($book->cover_image) Storage::disk('public')->delete($book->cover_image);
            $data['cover_image'] = $request->file('cover_image')->store('book_covers', 'public');
        }

        $book->update($data);
        return response()->json($book->load(['author', 'category', 'publisher']));
    }

    public function destroy(Book $book): JsonResponse
    {
        $book->delete();
        return response()->json(['message' => 'Book deleted.']);
    }
}
