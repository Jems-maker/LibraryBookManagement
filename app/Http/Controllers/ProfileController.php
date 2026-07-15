<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        $activeBorrows = collect();
        $borrowHistory = collect();

        if ($request->user()->role === 'student') {
            $activeBorrows = \App\Models\BorrowRecord::with(['book.author', 'book.category'])
                ->where('user_id', $request->user()->id)
                ->whereIn('status', ['Pending Claim', 'Borrowed', 'Overdue'])
                ->latest()
                ->get();

            $borrowHistory = \App\Models\BorrowRecord::with(['book.author'])
                ->where('user_id', $request->user()->id)
                ->where('status', 'Returned')
                ->latest()
                ->limit(5)
                ->get();
        }

        return view('profile.edit', [
            'user'          => $request->user(),
            'activeBorrows' => $activeBorrows,
            'borrowHistory' => $borrowHistory,
        ]);
    }

    /**
     * Update the student's gender only.
     */
    public function updateGender(Request $request): RedirectResponse
    {
        $request->validate([
            'gender' => ['required', 'in:Male,Female'],
        ]);

        $user = $request->user();

        if ($user->profile) {
            $user->profile->update(['gender' => $request->gender]);
        } else {
            $user->profile()->create(['gender' => $request->gender, 'user_id' => $user->id]);
        }

        return Redirect::route('profile.edit')->with('status', 'gender-updated');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
