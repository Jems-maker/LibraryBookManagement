<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublisherApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Publisher::orderBy('name');
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
        $d = $request->validate(['name'=>'required|string|unique:publishers,name','address'=>'nullable|string']);
        return response()->json(Publisher::create($d), 201);
    }
    public function update(Request $request, Publisher $publisher): JsonResponse {
        $d = $request->validate(['name'=>'sometimes|string|unique:publishers,name,'.$publisher->id,'address'=>'nullable|string']);
        $publisher->update($d); return response()->json($publisher);
    }
    public function destroy(Publisher $publisher): JsonResponse { $publisher->delete(); return response()->json(['message'=>'Deleted.']); }
}