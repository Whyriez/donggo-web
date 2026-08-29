<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LearnerUserController extends Controller
{
    /**
     * Display a listing of learner users.
     */
    public function index(Request $request): Response
    {
        $query = AppUser::query()
            ->withCount(['videoPlayLogs as total_video_plays'])
            ->withSum('voiceReplacementLogs as total_voice_replacements', 'replacement_count');

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('device_id', 'like', "%{$search}%")
                    ->orWhere('education_class', 'like', "%{$search}%")
                    ->orWhere('app_goal', 'like', "%{$search}%");
            });
        }

        // Education Level Filter
        if ($request->filled('education_level')) {
            $query->where('education_level', $request->input('education_level'));
        }

        // Age Phase Filter
        if ($request->filled('age_phase')) {
            $query->where('age_phase', $request->input('age_phase'));
        }

        // Gorontalo Frequency Filter
        if ($request->filled('gorontalo_frequency')) {
            $query->where('gorontalo_frequency', $request->input('gorontalo_frequency'));
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        // Unique filter options for dropdowns
        $educationLevels = AppUser::whereNotNull('education_level')->distinct()->pluck('education_level');
        $agePhases = AppUser::whereNotNull('age_phase')->distinct()->pluck('age_phase');
        $frequencies = AppUser::whereNotNull('gorontalo_frequency')->distinct()->pluck('gorontalo_frequency');

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $request->input('search', ''),
                'education_level' => $request->input('education_level', ''),
                'age_phase' => $request->input('age_phase', ''),
                'gorontalo_frequency' => $request->input('gorontalo_frequency', ''),
            ],
            'options' => [
                'education_levels' => $educationLevels,
                'age_phases' => $agePhases,
                'frequencies' => $frequencies,
            ],
        ]);
    }

    /**
     * Display detailed activity and demographic profile of a single learner user.
     */
    public function show(int $id): Response
    {
        $user = AppUser::findOrFail($id);

        // 1. Video Plays Breakdown per Story and Scene
        $videoPlays = VideoPlayLog::where('app_user_id', $id)
            ->select(
                'story_title',
                'scene_title',
                'video_name',
                DB::raw('count(*) as play_count'),
                DB::raw('sum(duration_seconds) as total_duration_seconds'),
                DB::raw('max(played_at) as last_played_at')
            )
            ->groupBy('story_title', 'scene_title', 'video_name')
            ->orderByDesc('play_count')
            ->get();

        // 2. Voice Replacement Breakdown per Story and Scene
        $voiceReplacements = VoiceReplacementLog::where('app_user_id', $id)
            ->select(
                'story_title',
                'scene_title',
                'action_type',
                DB::raw('sum(replacement_count) as total_replacements'),
                DB::raw('max(recorded_at) as last_recorded_at')
            )
            ->groupBy('story_title', 'scene_title', 'action_type')
            ->orderByDesc('total_replacements')
            ->get();

        // 3. Activity Timeline (chronological raw logs)
        $playLogs = VideoPlayLog::where('app_user_id', $id)
            ->latest('played_at')
            ->limit(30)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => 'p_'.$log->id,
                    'type' => 'play',
                    'title' => 'Memutar Video: '.$log->story_title,
                    'subtitle' => $log->scene_title.($log->video_name ? " ({$log->video_name})" : ''),
                    'badge' => 'Video Play',
                    'detail' => ($log->duration_seconds ? "Durasi: {$log->duration_seconds}s" : '').($log->is_completed ? ' • Selesai' : ''),
                    'timestamp' => $log->played_at?->format('d M Y, H:i') ?? $log->created_at->format('d M Y, H:i'),
                    'raw_time' => $log->played_at ?? $log->created_at,
                ];
            });

        $voiceLogs = VoiceReplacementLog::where('app_user_id', $id)
            ->latest('recorded_at')
            ->limit(30)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => 'v_'.$log->id,
                    'type' => 'voice',
                    'title' => 'Ganti Suara Dubbing: '.$log->story_title,
                    'subtitle' => $log->scene_title,
                    'badge' => 'Voice Dubbing',
                    'detail' => "Jumlah ganti: {$log->replacement_count}x".($log->audio_duration_seconds ? " • Audio: {$log->audio_duration_seconds}s" : ''),
                    'timestamp' => $log->recorded_at?->format('d M Y, H:i') ?? $log->created_at->format('d M Y, H:i'),
                    'raw_time' => $log->recorded_at ?? $log->created_at,
                ];
            });

        $timeline = $playLogs->concat($voiceLogs)
            ->sortByDesc('raw_time')
            ->values()
            ->take(40);

        $totalPlays = VideoPlayLog::where('app_user_id', $id)->count();
        $totalVoices = (int) (VoiceReplacementLog::where('app_user_id', $id)->sum('replacement_count') ?: VoiceReplacementLog::where('app_user_id', $id)->count());

        return Inertia::render('admin/users/show', [
            'user' => $user,
            'summary' => [
                'total_plays' => $totalPlays,
                'total_voices' => $totalVoices,
                'distinct_stories_played' => VideoPlayLog::where('app_user_id', $id)->distinct('story_title')->count('story_title'),
                'distinct_scenes_dubbed' => VoiceReplacementLog::where('app_user_id', $id)->distinct('scene_title')->count('scene_title'),
            ],
            'video_plays' => $videoPlays,
            'voice_replacements' => $voiceReplacements,
            'timeline' => $timeline,
        ]);
    }

    /**
     * Delete a learner user profile and associated logs.
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = AppUser::findOrFail($id);
        $user->delete();

        return back()->with('success', 'Data monitoring pengguna berhasil dihapus.');
    }
}
