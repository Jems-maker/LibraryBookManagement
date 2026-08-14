<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AuthorApiController extends Controller
{
    const CACHE_KEY = 'authors_all_v2';
    const CACHE_TTL = 3600; // 1 hour

    public function index(Request $request): JsonResponse
    {
        $query = Author::orderBy('name');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%{$s}%");
        }
        if ($request->has('all')) {
            return response()->json(Cache::remember(self::CACHE_KEY, self::CACHE_TTL, fn () => $query->get()->values()->all()));
        }
        return response()->json($query->paginate(8)->withQueryString());
    }

    public function store(Request $request): JsonResponse {
        $d = $request->validate(['name'=>'required|string|unique:authors,name','bio'=>'nullable|string']);
        $result = Author::create($d);
        Cache::forget(self::CACHE_KEY);
        return response()->json($result, 201);
    }

    public function update(Request $request, Author $author): JsonResponse {
        $d = $request->validate(['name'=>'sometimes|string|unique:authors,name,'.$author->id,'bio'=>'nullable|string']);
        $author->update($d);
        Cache::forget(self::CACHE_KEY);
        return response()->json($author);
    }

    public function destroy(Author $author): JsonResponse {
        $author->delete();
        Cache::forget(self::CACHE_KEY);
        return response()->json(['message'=>'Deleted.']);
    }
}
