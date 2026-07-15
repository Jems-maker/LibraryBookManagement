<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Category::latest();
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%{$s}%")
                  ->orWhere('slug', 'like', "%{$s}%");
        }
        $categories = $query->paginate(10)->withQueryString();
        return view('admin.categories.index', compact('categories'));
    }

    public function create()
    {
        return view('admin.categories.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'slug' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
        ]);

        \App\Models\Category::create($validated);
        return redirect()->route('admin.categories.index')->with('success', 'Category created successfully.');
    }

    public function edit(\App\Models\Category $category)
    {
        return view('admin.categories.edit', compact('category'));
    }

    public function update(Request $request, \App\Models\Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,'.$category->id,
            'slug' => 'required|string|max:255|unique:categories,slug,'.$category->id,
            'description' => 'nullable|string',
        ]);

        $category->update($validated);
        return redirect()->route('admin.categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(\App\Models\Category $category)
    {
        $category->delete();
        return redirect()->route('admin.categories.index')->with('success', 'Category deleted successfully.');
    }
}
