<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        return view('admin.settings.index', compact('settings'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'school_name' => 'nullable|string|max:255',
            'librarian_name' => 'nullable|string|max:255',
            'school_head_role' => 'nullable|in:School President,School Principal',
            'school_head_name' => 'nullable|string|max:255',
            'school_logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $keys = ['school_name', 'librarian_name', 'school_head_role', 'school_head_name'];

        foreach ($keys as $key) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $request->input($key)]
            );
        }

        if ($request->hasFile('school_logo')) {
            $path = $request->file('school_logo')->store('settings', 'public');
            Setting::updateOrCreate(
                ['key' => 'school_logo'],
                ['value' => $path]
            );
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
