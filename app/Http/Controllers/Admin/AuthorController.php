<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Author;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        $query = Author::latest();
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%{$s}%")
                  ->orWhere('bio', 'like', "%{$s}%");
        }
        $authors = $query->paginate(10)->withQueryString();
        return view('admin.authors.index', compact('authors'));
    }

    public function create()
    {
        return view('admin.authors.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
        ]);

        Author::create($validated);
        return redirect()->route('admin.authors.index')->with('success', 'Author created successfully.');
    }

    public function edit(Author $author)
    {
        return view('admin.authors.edit', compact('author'));
    }

    public function update(Request $request, Author $author)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
        ]);

        $author->update($validated);
        return redirect()->route('admin.authors.index')->with('success', 'Author updated successfully.');
    }

    public function destroy(Author $author)
    {
        $author->delete();
        return redirect()->route('admin.authors.index')->with('success', 'Author deleted successfully.');
    }
}
