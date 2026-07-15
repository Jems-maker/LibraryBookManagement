<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Author::orderBy('name');
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
        $d = $request->validate(['name'=>'required|string|unique:authors,name','bio'=>'nullable|string']);
        return response()->json(Author::create($d), 201);
    }
    public function update(Request $request, Author $author): JsonResponse {
        $d = $request->validate(['name'=>'sometimes|string|unique:authors,name,'.$author->id,'bio'=>'nullable|string']);
        $author->update($d); return response()->json($author);
    }
    public function destroy(Author $author): JsonResponse { $author->delete(); return response()->json(['message'=>'Deleted.']); }
}