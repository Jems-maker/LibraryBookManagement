<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AwardApiController extends Controller
{
    public function index(): JsonResponse
    {
        $students = User::where('role', 'student')
            ->with('profile')
            ->withSum('rewardPoints as total_points', 'points')
            ->orderByDesc('total_points')
            ->get();

        return response()->json($students);
    }

    public function download(User $student): \Symfony\Component\HttpFoundation\Response
    {
        $settings = Setting::first();
        $student->load('profile');
        $student->total_points = $student->rewardPoints()->sum('points');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('admin.awards.certificate', [
            'student'  => $student,
            'settings' => $settings,
        ])->setPaper([0, 0, 842, 595], 'landscape');

        return $pdf->download("certificate-{$student->student_id}.pdf");
    }
}
