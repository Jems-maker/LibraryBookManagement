<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublisherApiController extends Controller
{
    const CACHE_KEY = 'publishers_all_v2';
    const CACHE_TTL = 3600; // 1 hour

    public function index(Request $request): JsonResponse
    {
        $query = Publisher::orderBy('name');
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
        $d = $request->validate(['name'=>'required|string|unique:publishers,name','address'=>'nullable|string']);
        $result = Publisher::create($d);
        Cache::forget(self::CACHE_KEY);
        return response()->json($result, 201);
    }

    public function update(Request $request, Publisher $publisher): JsonResponse {
        $d = $request->validate(['name'=>'sometimes|string|unique:publishers,name,'.$publisher->id,'address'=>'nullable|string']);
        $publisher->update($d);
        Cache::forget(self::CACHE_KEY);
        return response()->json($publisher->fresh());
    }

    public function destroy(Publisher $publisher): JsonResponse {
        $publisher->delete();
        Cache::forget(self::CACHE_KEY);
        return response()->json(['message'=>'Deleted.']);
    }
}
