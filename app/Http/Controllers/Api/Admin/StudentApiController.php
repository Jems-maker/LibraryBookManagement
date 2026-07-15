<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'student')
            ->with('profile')
            ->withSum('rewardPoints as total_points', 'points');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) =>
                $q->where('name', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('student_id', 'like', "%$s%")
            );
        }

        $students = $query->orderBy('name')->paginate(8)->withQueryString();

        return response()->json($students);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'student_id' => 'required|string|unique:users,student_id',
            'password'   => 'required|string|min:8',
            'course'     => 'required|string|max:255',
            'year_level' => 'required|string|max:255',
        ]);

        $userData = [
            'name'       => $data['name'],
            'email'      => $data['email'],
            'student_id' => $data['student_id'],
            'password'   => \Illuminate\Support\Facades\Hash::make($data['password']),
            'role'       => 'student',
        ];

        $student = User::create($userData);
        
        $student->profile()->create([
            'course'     => $data['course'],
            'year_level' => $data['year_level'],
        ]);

        return response()->json($student->load('profile'), 201);
    }

    public function show(User $student): JsonResponse
    {
        $student->load(['profile', 'borrowRecords.book.author']);
        $student->total_points = $student->rewardPoints()->sum('points');
        return response()->json($student);
    }

    public function update(Request $request, User $student): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|unique:users,email,' . $student->id,
            'student_id' => 'sometimes|string|unique:users,student_id,' . $student->id,
            'course'     => 'sometimes|string|max:255',
            'year_level' => 'sometimes|string|max:255',
        ]);

        $student->update($request->only(['name', 'email', 'student_id']));

        if ($request->has('course') || $request->has('year_level')) {
            $profileData = $request->only(['course', 'year_level']);
            
            if ($student->profile) {
                $student->profile->update($profileData);
            } else {
                $student->profile()->create($profileData);
            }
        }

        return response()->json($student->fresh()->load('profile'));
    }

    public function destroy(User $student): JsonResponse
    {
        $student->delete();
        return response()->json(['message' => 'Student deleted.']);
    }
}
