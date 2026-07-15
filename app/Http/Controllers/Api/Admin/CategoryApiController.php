<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::orderBy('name');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%{$s}%");
        }
        if ($request->has('all')) {
            return response()->json($query->get());
        }
        return response()->json($query->paginate(8)->withQueryString());
    }
    public function store(Request $request): JsonResponse {
        $d = $request->validate(['name' => 'required|string|unique:categories,name', 'slug' => 'sometimes|string|unique:categories,slug']);
        if (!isset($d['slug'])) $d['slug'] = Str::slug($d['name']);
        return response()->json(Category::create($d), 201);
    }
    public function update(Request $request, Category $category): JsonResponse {
        $d = $request->validate(['name' => 'sometimes|string|unique:categories,name,'.$category->id, 'slug' => 'sometimes|string']);
        $category->update($d);
        return response()->json($category);
    }
    public function destroy(Category $category): JsonResponse { $category->delete(); return response()->json(['message'=>'Deleted.']); }
}