<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::query();
        
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
        }

        // Check if we want all courses without pagination (for dropdowns)
        if ($request->boolean('all')) {
            return response()->json($query->orderBy('name')->get());
        }

        $courses = $query->orderBy('name')->paginate(8)->withQueryString();
        return response()->json($courses);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:courses',
            'description' => 'nullable|string|max:255',
        ]);

        $course = Course::create($data);
        return response()->json($course, 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255|unique:courses,name,' . $course->id,
            'description' => 'nullable|string|max:255',
        ]);

        $course->update($data);
        return response()->json($course);
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();
        return response()->json(['message' => 'Course deleted.']);
    }
}
