<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Export all learner users along with aggregated play & voice counts to CSV.
     */
    public function exportUsersCsv(): StreamedResponse
    {
        $filename = 'donggo_learners_'.date('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            // Add UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header row
            fputcsv($handle, [
                'ID',
                'Device ID',
                'Nama Siswa',
                'Usia',
                'Jenis Kelamin',
                'Jenjang Pendidikan',
                'Kelas',
                'Frekuensi Bahasa Gorontalo',
                'Tujuan Penggunaan',
                'Fase Usia',
                'Total Video Dimainkan',
                'Total Pergantian Suara (Dubbing)',
                'Tanggal Registrasi',
            ]);

            AppUser::withCount(['videoPlayLogs as total_video_plays'])
                ->withSum('voiceReplacementLogs as total_voice_replacements', 'replacement_count')
                ->chunk(100, function ($users) use ($handle) {
                    foreach ($users as $user) {
                        fputcsv($handle, [
                            $user->id,
                            $user->device_id ?? '-',
                            $user->name,
                            $user->age ?? '-',
                            $user->gender ?? '-',
                            $user->education_level ?? '-',
                            $user->education_class ?? '-',
                            $user->gorontalo_frequency ?? '-',
                            $user->app_goal ?? '-',
                            $user->age_phase ?? '-',
                            $user->total_video_plays,
                            $user->total_voice_replacements ?? 0,
                            $user->created_at->format('Y-m-d H:i:s'),
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export raw activity logs (video plays & voice replacements) to CSV.
     */
    public function exportLogsCsv(): StreamedResponse
    {
        $filename = 'donggo_activity_logs_'.date('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header row
            fputcsv($handle, [
                'Tipe Aktivitas',
                'ID Log',
                'ID Pengguna',
                'Nama Pengguna',
                'Device ID',
                'Judul Cerita',
                'Judul Scene',
                'Detail / Nama Video / Aksi',
                'Metrik (Durasi / Jumlah Ganti)',
                'Waktu Kejadian',
            ]);

            // Video Plays
            VideoPlayLog::with('appUser')->chunk(200, function ($plays) use ($handle) {
                foreach ($plays as $p) {
                    fputcsv($handle, [
                        'Play Video',
                        $p->id,
                        $p->app_user_id ?? '-',
                        $p->appUser?->name ?? 'Anonim',
                        $p->device_id ?? '-',
                        $p->story_title,
                        $p->scene_title,
                        $p->video_name ?: 'Video Animasi',
                        "{$p->duration_seconds}s".($p->is_completed ? ' (Completed)' : ''),
                        $p->played_at?->format('Y-m-d H:i:s') ?? $p->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            // Voice Replacements
            VoiceReplacementLog::with('appUser')->chunk(200, function ($voices) use ($handle) {
                foreach ($voices as $v) {
                    fputcsv($handle, [
                        'Voice Dubbing',
                        $v->id,
                        $v->app_user_id ?? '-',
                        $v->appUser?->name ?? 'Anonim',
                        $v->device_id ?? '-',
                        $v->story_title,
                        $v->scene_title,
                        $v->action_type,
                        "{$v->replacement_count}x".($v->audio_duration_seconds ? " ({$v->audio_duration_seconds}s)" : ''),
                        $v->recorded_at?->format('Y-m-d H:i:s') ?? $v->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
