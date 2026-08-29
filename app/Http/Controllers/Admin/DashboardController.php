<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\Story;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin monitoring dashboard.
     */
    public function index(Request $request): Response
    {
        $totalUsers = AppUser::count();
        $totalVideoPlays = VideoPlayLog::count();
        $totalVoiceReplacements = VoiceReplacementLog::sum('replacement_count') ?: VoiceReplacementLog::count();
        $totalStories = Story::count();

        // 7-day activity trend
        $dateThreshold = now()->subDays(6)->startOfDay();
        $playTrends = VideoPlayLog::select(DB::raw('DATE(played_at) as date'), DB::raw('count(*) as count'))
            ->where('played_at', '>=', $dateThreshold)
            ->groupBy(DB::raw('DATE(played_at)'))
            ->pluck('count', 'date')
            ->toArray();

        $voiceTrends = VoiceReplacementLog::select(DB::raw('DATE(recorded_at) as date'), DB::raw('SUM(replacement_count) as count'))
            ->where('recorded_at', '>=', $dateThreshold)
            ->groupBy(DB::raw('DATE(recorded_at)'))
            ->pluck('count', 'date')
            ->toArray();

        $chartDays = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i)->format('Y-m-d');
            $chartDays[] = [
                'date' => now()->subDays($i)->format('d M'),
                'plays' => (int) ($playTrends[$day] ?? 0),
                'voices' => (int) ($voiceTrends[$day] ?? 0),
            ];
        }

        // Top Stories played
        $topPlayedStories = VideoPlayLog::select('story_title', DB::raw('count(*) as total_plays'))
            ->groupBy('story_title')
            ->orderByDesc('total_plays')
            ->limit(5)
            ->get();

        // Top Scenes voice-replaced
        $topDubbedScenes = VoiceReplacementLog::select('story_title', 'scene_title', DB::raw('sum(replacement_count) as total_dubbed'))
            ->groupBy('story_title', 'scene_title')
            ->orderByDesc('total_dubbed')
            ->limit(5)
            ->get();

        // Demographics breakdowns
        $educationDistribution = AppUser::select('education_level', DB::raw('count(*) as count'))
            ->whereNotNull('education_level')
            ->groupBy('education_level')
            ->orderByDesc('count')
            ->get();

        $gorontaloFrequencyDistribution = AppUser::select('gorontalo_frequency', DB::raw('count(*) as count'))
            ->whereNotNull('gorontalo_frequency')
            ->groupBy('gorontalo_frequency')
            ->orderByDesc('count')
            ->get();

        $agePhaseDistribution = AppUser::select('age_phase', DB::raw('count(*) as count'))
            ->whereNotNull('age_phase')
            ->groupBy('age_phase')
            ->orderByDesc('count')
            ->get();

        // Recent Activity Feed
        $recentPlays = VideoPlayLog::with('appUser')
            ->latest('played_at')
            ->limit(6)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => 'play_'.$log->id,
                    'type' => 'play',
                    'user_name' => $log->appUser?->name ?? 'Anonim ('.$log->device_id.')',
                    'story_title' => $log->story_title,
                    'scene_title' => $log->scene_title,
                    'detail' => $log->video_name ?: 'Pemutaran Video Animasi',
                    'timestamp' => $log->played_at?->diffForHumans() ?? $log->created_at->diffForHumans(),
                    'raw_time' => $log->played_at ?? $log->created_at,
                ];
            });

        $recentVoices = VoiceReplacementLog::with('appUser')
            ->latest('recorded_at')
            ->limit(6)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => 'voice_'.$log->id,
                    'type' => 'voice',
                    'user_name' => $log->appUser?->name ?? 'Anonim ('.$log->device_id.')',
                    'story_title' => $log->story_title,
                    'scene_title' => $log->scene_title,
                    'detail' => 'Ganti Suara ('.$log->replacement_count.'x'.($log->audio_duration_seconds ? ', '.$log->audio_duration_seconds.'s' : '').')',
                    'timestamp' => $log->recorded_at?->diffForHumans() ?? $log->created_at->diffForHumans(),
                    'raw_time' => $log->recorded_at ?? $log->created_at,
                ];
            });

        $combinedActivities = $recentPlays->concat($recentVoices)
            ->sortByDesc('raw_time')
            ->values()
            ->take(8);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'total_video_plays' => $totalVideoPlays,
                'total_voice_replacements' => $totalVoiceReplacements,
                'total_stories' => $totalStories,
            ],
            'chart_days' => $chartDays,
            'top_played_stories' => $topPlayedStories,
            'top_dubbed_scenes' => $topDubbedScenes,
            'education_distribution' => $educationDistribution,
            'gorontalo_frequency_distribution' => $gorontaloFrequencyDistribution,
            'age_phase_distribution' => $agePhaseDistribution,
            'recent_activities' => $combinedActivities,
        ]);
    }
}
