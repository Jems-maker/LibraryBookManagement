<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Book;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['author', 'publisher', 'category']);
        
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('book_id', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort', 'id');
        $sortDir = $request->get('dir', 'desc');
        $allowedSorts = ['id', 'title', 'available_copies', 'status'];
        if (!in_array($sortBy, $allowedSorts)) $sortBy = 'id';
        if (!in_array($sortDir, ['asc', 'desc'])) $sortDir = 'desc';

        $books = $query->orderBy($sortBy, $sortDir)->paginate(7)->withQueryString();
        
        // Return just the table partial for live-search AJAX requests
        if ($request->ajax()) {
            return view('admin.books._table', compact('books'));
        }
        
        $categories = \App\Models\Category::all();
        $authors = \App\Models\Author::all();
        $publishers = \App\Models\Publisher::all();
        
        return view('admin.books.index', compact('books', 'categories', 'authors', 'publishers'));
    }

    public function create()
    {
        $categories = \App\Models\Category::all();
        $authors = \App\Models\Author::all();
        $publishers = \App\Models\Publisher::all();
        return view('admin.books.create', compact('categories', 'authors', 'publishers'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author_id' => 'required|exists:authors,id',
            'publisher_id' => 'required|exists:publishers,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|mimes:jpeg,jpg,png|max:2048',
            'total_copies' => 'required|integer|min:1',
        ]);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('books', 'public');
        }

        $validated['available_copies'] = $validated['total_copies'];

        // Auto-generate a unique book_id like BK-00042
        do {
            $validated['book_id'] = 'BK-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        } while (Book::where('book_id', $validated['book_id'])->exists());
        
        Book::create($validated);
        return redirect()->route('admin.books.index')->with('success', 'Book created successfully.');
    }

    public function edit(Book $book)
    {
        $categories = \App\Models\Category::all();
        $authors = \App\Models\Author::all();
        $publishers = \App\Models\Publisher::all();
        return view('admin.books.edit', compact('book', 'categories', 'authors', 'publishers'));
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'book_id' => 'required|string|unique:books,book_id,'.$book->id,
            'title' => 'required|string|max:255',
            'author_id' => 'required|exists:authors,id',
            'publisher_id' => 'required|exists:publishers,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|image|max:2048',
            'total_copies' => 'required|integer|min:1',
            'status' => 'sometimes|in:Available,Unavailable',
        ]);

        if ($request->hasFile('cover_image')) {
            if ($book->cover_image) {
                Storage::disk('public')->delete($book->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('books', 'public');
        }

        // Adjust available copies if total copies changed
        $diff = $validated['total_copies'] - $book->total_copies;
        $validated['available_copies'] = $book->available_copies + $diff;

        // Ensure available_copies never exceeds total_copies
        if ($validated['available_copies'] > $validated['total_copies']) {
            $validated['available_copies'] = $validated['total_copies'];
        }

        // If status was provided, map it; otherwise ensure it's derived from available_copies
        if (!isset($validated['status'])) {
            $validated['status'] = $validated['available_copies'] > 0 ? 'Available' : 'Unavailable';
        } else {
            // Enforce: status must match available_copies > 0
            if ($validated['status'] === 'Available' && $validated['available_copies'] <= 0) {
                $validated['status'] = 'Unavailable';
            } elseif ($validated['status'] === 'Unavailable' && $validated['available_copies'] > 0) {
                $validated['status'] = 'Available';
            }
        }

        $book->update($validated);
        return redirect()->route('admin.books.index')->with('success', 'Book updated successfully.');
    }

    public function destroy(Book $book)
    {
        if ($book->cover_image) {
            Storage::disk('public')->delete($book->cover_image);
        }
        $book->delete();
        return redirect()->route('admin.books.index')->with('success', 'Book deleted successfully.');
    }
}
