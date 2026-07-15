<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'student')->with('profile');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('student_id', 'like', "%{$search}%")
                  ->orWhereHas('profile', function ($q2) use ($search) {
                      $q2->where('course', 'like', "%{$search}%");
                  });
            });
        }

        $students = $query->latest()->paginate(10);

        return view('admin.students.index', compact('students'));
    }

    public function create()
    {
        return view('admin.students.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'student_id' => ['required', 'string', 'max:255', 'unique:users,student_id'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'course' => ['required', 'string', 'max:255'],
            'year_level' => ['required', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'student_id' => $request->student_id,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student',
        ]);

        StudentProfile::create([
            'user_id' => $user->id,
            'course' => $request->course,
            'year_level' => $request->year_level,
        ]);

        return redirect()->route('admin.students.index')->with('success', 'Student account created successfully.');
    }

    public function edit(User $student)
    {
        $student->load('profile');
        return view('admin.students.edit', compact('student'));
    }

    public function update(Request $request, User $student)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'student_id' => ['required', 'string', 'max:255', Rule::unique('users', 'student_id')->ignore($student->id)],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($student->id)],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
            'course' => ['required', 'string', 'max:255'],
            'year_level' => ['required', 'string', 'max:255'],
        ]);

        $student->update([
            'name' => $request->name,
            'student_id' => $request->student_id,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $student->update(['password' => Hash::make($request->password)]);
        }

        $student->profile()->updateOrCreate(
            ['user_id' => $student->id],
            [
                'course' => $request->course,
                'year_level' => $request->year_level,
            ]
        );

        return redirect()->route('admin.students.index')->with('success', 'Student updated successfully.');
    }

    public function destroy(User $student)
    {
        $student->delete();
        return redirect()->route('admin.students.index')->with('success', 'Student deleted successfully.');
    }
}
