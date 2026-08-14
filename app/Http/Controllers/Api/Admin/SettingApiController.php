<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingApiController extends Controller
{
    // Maps API field names to settings table keys
    protected static array $keyMap = [
        'school_name'    => 'school_name',
        'librarian_name' => 'librarian_name',
        'head_role'      => 'school_head_role',
        'head_name'      => 'school_head_name',
        'penalty_amount'            => 'late_penalty_per_day',
        'penalty_grace_period_mins' => 'penalty_grace_period_mins',
        'penalty_grace_period_days' => 'penalty_grace_period_days',
        'auto_reject_mins'          => 'auto_reject_mins',
        'auto_expire_mins'          => 'auto_expire_mins',
        'school_logo'               => 'school_logo',
        'admin_avatar'              => 'admin_avatar',
    ];

    public function index(): JsonResponse
    {
        $user = auth()->user();
        $data = [
            'admin_name'  => $user->name,
            'admin_email' => $user->email,
        ];

        foreach (self::$keyMap as $apiKey => $dbKey) {
            $val = Setting::getValue($dbKey);
            if ($apiKey === 'school_logo' && $val) {
                $data['logo_url'] = asset('storage/' . $val);
            } elseif ($apiKey === 'school_logo') {
                continue;
            }
            if ($apiKey === 'admin_avatar' && $val) {
                $data['avatar_url'] = asset('storage/' . $val);
            } elseif ($apiKey === 'admin_avatar') {
                continue;
            }
            $data[$apiKey] = $val;
        }

        return response()->json($data);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'school_name'               => 'sometimes|nullable|string|max:255',
            'librarian_name'            => 'sometimes|nullable|string|max:255',
            'head_role'                 => 'sometimes|nullable|in:School President,School Principal',
            'head_name'                 => 'sometimes|nullable|string|max:255',
            'penalty_amount'            => 'sometimes|nullable|numeric|min:0',
            'penalty_grace_period_mins' => 'sometimes|nullable|integer|min:0',
            'penalty_grace_period_days' => 'sometimes|nullable|integer|min:0',
            'auto_reject_mins'          => 'sometimes|nullable|integer|min:1',
            'auto_expire_mins'          => 'sometimes|nullable|integer|min:1',
            'logo'                      => 'nullable|image|max:2048',
            'avatar'                    => 'nullable|image|max:2048',
            'admin_name'                => 'sometimes|nullable|string|max:255',
            'admin_email'               => 'sometimes|nullable|email|max:255|unique:users,email,' . auth()->id(),
        ]);

        if ($validator->fails()) {
            \Log::error('Settings Validation Failed:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach (self::$keyMap as $apiKey => $dbKey) {
            if ($request->filled($apiKey)) {
                Setting::updateOrCreate(['key' => $dbKey], ['value' => $request->$apiKey]);
            }
        }

        if ($request->hasFile('logo')) {
            $oldLogo = Setting::getValue('school_logo');
            if ($oldLogo) Storage::disk('public')->delete($oldLogo);
            $path = $request->file('logo')->store('settings', 'public');
            Setting::updateOrCreate(['key' => 'school_logo'], ['value' => $path]);
        }

        if ($request->hasFile('avatar')) {
            $oldAvatar = Setting::getValue('admin_avatar');
            if ($oldAvatar) Storage::disk('public')->delete($oldAvatar);
            $path = $request->file('avatar')->store('settings', 'public');
            Setting::updateOrCreate(['key' => 'admin_avatar'], ['value' => $path]);
        }

        // Update admin profile
        $user = auth()->user();
        if ($request->filled('admin_name'))  $user->name  = $request->admin_name;
        if ($request->filled('admin_email')) $user->email = $request->admin_email;
        $user->save();

        // Build response
        $response = [];
        foreach (self::$keyMap as $apiKey => $dbKey) {
            $val = Setting::getValue($dbKey);
            if ($apiKey === 'school_logo' && $val) {
                $response['logo_url'] = asset('storage/' . $val);
            } elseif ($apiKey === 'school_logo') {
                continue;
            }
            if ($apiKey === 'admin_avatar' && $val) {
                $response['avatar_url'] = asset('storage/' . $val);
            } elseif ($apiKey === 'admin_avatar') {
                continue;
            }
            $response[$apiKey] = $val;
        }
        $response['admin_name']  = $user->name;
        $response['admin_email'] = $user->email;

        return response()->json($response);
    }
}