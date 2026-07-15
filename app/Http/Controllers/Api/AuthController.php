<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');
        $user->total_points = $user->rewardPoints()->sum('points');
        return response()->json($user);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        // Support login with email OR student_id
        $field = filter_var($request->email, FILTER_VALIDATE_EMAIL) ? 'email' : 'student_id';

        if (!Auth::attempt([$field => $request->email, 'password' => $request->password])) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        $request->session()->regenerate();

        $user = $request->user()->load('profile');
        $user->total_points = $user->rewardPoints()->sum('points');

        return response()->json(['user' => $user]);
    }

    public function adminLogin(Request $request): JsonResponse
    {
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($request->only('username', 'password'))) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        $user = $request->user()->load('profile');

        if ($user->role !== 'admin') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return response()->json(['message' => 'This login is restricted to administrators only.'], 403);
        }

        $request->session()->regenerate();
        $user->total_points = $user->rewardPoints()->sum('points');

        return response()->json(['user' => $user]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out.']);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'username'              => 'required|string|unique:users,username',
            'student_id'            => 'required|string|unique:users,student_id',
            'password'              => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'username'   => $request->username,
            'student_id' => $request->student_id,
            'password'   => Hash::make($request->password),
            'role'       => 'student',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user->load('profile')], 201);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        // Delegate to standard password reset
        $request->validate(['email' => 'required|email']);
        \Illuminate\Support\Facades\Password::sendResetLink($request->only('email'));
        return response()->json(['message' => 'Password reset link sent if the email exists.']);
    }
}
