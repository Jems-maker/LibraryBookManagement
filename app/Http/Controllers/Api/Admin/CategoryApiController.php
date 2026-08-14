<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryApiController extends Controller
{
    const CACHE_KEY = 'categories_all_v2';
    const CACHE_TTL = 3600; // 1 hour

    public function index(Request $request): JsonResponse
    {
        $query = Category::orderBy('name');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%{$s}%");
        }
        if ($request->has('all')) {
            $categories = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, fn () => $query->get()->values()->all());
            return response()->json($categories ?? []);
        }
        return response()->json($query->paginate(8)->withQueryString());
    }

    public function store(Request $request): JsonResponse {
        $d = $request->validate(['name' => 'required|string|unique:categories,name', 'slug' => 'sometimes|string|unique:categories,slug']);
        if (!isset($d['slug'])) $d['slug'] = Str::slug($d['name']);
        $result = Category::create($d);
        Cache::forget(self::CACHE_KEY);
        return response()->json($result, 201);
    }

    public function update(Request $request, Category $category): JsonResponse {
        $d = $request->validate(['name' => 'sometimes|string|unique:categories,name,'.$category->id, 'slug' => 'sometimes|string']);
        $category->update($d);
        Cache::forget(self::CACHE_KEY);
        return response()->json($category);
    }

    public function destroy(Category $category): JsonResponse {
        $category->delete();
        Cache::forget(self::CACHE_KEY);
        return response()->json(['message'=>'Deleted.']);
    }
}
