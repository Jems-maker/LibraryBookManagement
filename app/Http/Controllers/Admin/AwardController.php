<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;

class AwardController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', '!=', 'admin')
            ->withSum('rewardPoints', 'points')
            ->with('profile');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('student_id', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        $students = $query
            ->orderByDesc('reward_points_sum_points')
            ->paginate(10)
            ->withQueryString();

        return view('admin.awards.index', compact('students'));
    }

    public function certificate(User $student)
    {
        $pdf = $this->buildCertificatePdf($student);
        return $pdf->stream('certificate-' . $student->student_id . '.pdf');
    }

    public function download(User $student)
    {
        $pdf = $this->buildCertificatePdf($student);
        return $pdf->download('certificate-' . $student->student_id . '.pdf');
    }

    private function buildCertificatePdf(User $student)
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        $totalPoints = $student->rewardPoints()->sum('points');

        // Determine rank
        $rank = User::where('role', '!=', 'admin')
            ->withSum('rewardPoints', 'points')
            ->having('reward_points_sum_points', '>', $totalPoints)
            ->count() + 1;

        // Convert logo to base64 for embedding in PDF
        $logoBase64 = null;
        if (!empty($settings['school_logo'])) {
            $logoPath = storage_path('app/public/' . $settings['school_logo']);
            if (file_exists($logoPath)) {
                $logoData = file_get_contents($logoPath);
                $extension = pathinfo($logoPath, PATHINFO_EXTENSION);
                $mime = match(strtolower($extension)) {
                    'png' => 'image/png',
                    'jpg', 'jpeg' => 'image/jpeg',
                    default => 'image/png',
                };
                $logoBase64 = 'data:' . $mime . ';base64,' . base64_encode($logoData);
            }
        }

        $data = [
            'student' => $student,
            'totalPoints' => $totalPoints,
            'rank' => $rank,
            'settings' => $settings,
            'logoBase64' => $logoBase64,
        ];

        return Pdf::loadView('admin.awards.certificate', $data)
            ->setPaper('a4', 'landscape');
    }
}
