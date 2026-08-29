<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display the activity log stream.
     */
    public function index(Request $request): Response
    {
        $type = $request->input('type', 'all');
        $search = $request->input('search', '');

        $playLogs = collect();
        $voiceLogs = collect();

        if ($type === 'all' || $type === 'play') {
            $playQuery = VideoPlayLog::with('appUser')->latest('played_at');
            if ($search) {
                $playQuery->where(function ($q) use ($search) {
                    $q->where('story_title', 'like', "%{$search}%")
                        ->orWhere('scene_title', 'like', "%{$search}%")
                        ->orWhereHas('appUser', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%");
                        });
                });
            }
            $playLogs = $playQuery->limit(50)->get()->map(function ($log) {
                return [
                    'id' => 'play_'.$log->id,
                    'type' => 'play',
                    'user_id' => $log->app_user_id,
                    'user_name' => $log->appUser?->name ?? 'Anonim',
                    'device_id' => $log->device_id,
                    'story_title' => $log->story_title,
                    'scene_title' => $log->scene_title,
                    'detail' => $log->video_name ?: 'Video Pemutaran',
                    'metric' => ($log->duration_seconds ? "{$log->duration_seconds} detik" : '-').($log->is_completed ? ' (Selesai)' : ''),
                    'timestamp' => $log->played_at?->format('d M Y, H:i:s') ?? $log->created_at->format('d M Y, H:i:s'),
                    'raw_time' => $log->played_at ?? $log->created_at,
                ];
            });
        }

        if ($type === 'all' || $type === 'voice') {
            $voiceQuery = VoiceReplacementLog::with('appUser')->latest('recorded_at');
            if ($search) {
                $voiceQuery->where(function ($q) use ($search) {
                    $q->where('story_title', 'like', "%{$search}%")
                        ->orWhere('scene_title', 'like', "%{$search}%")
                        ->orWhereHas('appUser', function ($uq) use ($search) {
                            $uq->where('name', 'like', "%{$search}%");
                        });
                });
            }
            $voiceLogs = $voiceQuery->limit(50)->get()->map(function ($log) {
                return [
                    'id' => 'voice_'.$log->id,
                    'type' => 'voice',
                    'user_id' => $log->app_user_id,
                    'user_name' => $log->appUser?->name ?? 'Anonim',
                    'device_id' => $log->device_id,
                    'story_title' => $log->story_title,
                    'scene_title' => $log->scene_title,
                    'detail' => 'Rekaman Suara Baru ('.$log->action_type.')',
                    'metric' => "{$log->replacement_count}x ganti".($log->audio_duration_seconds ? " ({$log->audio_duration_seconds}s)" : ''),
                    'timestamp' => $log->recorded_at?->format('d M Y, H:i:s') ?? $log->created_at->format('d M Y, H:i:s'),
                    'raw_time' => $log->recorded_at ?? $log->created_at,
                ];
            });
        }

        $logs = $playLogs->concat($voiceLogs)
            ->sortByDesc('raw_time')
            ->values()
            ->take(60);

        return Inertia::render('admin/logs/index', [
            'logs' => $logs,
            'filters' => [
                'type' => $type,
                'search' => $search,
            ],
            'counts' => [
                'plays' => VideoPlayLog::count(),
                'voices' => VoiceReplacementLog::count(),
            ],
        ]);
    }
}
