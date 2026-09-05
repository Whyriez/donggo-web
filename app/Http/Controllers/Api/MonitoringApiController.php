<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\Scene;
use App\Models\Story;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MonitoringApiController extends Controller
{
    /**
     * Register or update Android learner profile data (UserMonitoringData).
     */
    public function registerUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'age' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'max:50'],
            'educationLevel' => ['nullable', 'string', 'max:100'],
            'education_level' => ['nullable', 'string', 'max:100'],
            'educationClass' => ['nullable', 'string', 'max:100'],
            'education_class' => ['nullable', 'string', 'max:100'],
            'gorontaloFrequency' => ['nullable', 'string', 'max:100'],
            'gorontalo_frequency' => ['nullable', 'string', 'max:100'],
            'appGoal' => ['nullable', 'string', 'max:255'],
            'app_goal' => ['nullable', 'string', 'max:255'],
            'agePhase' => ['nullable', 'string', 'max:100'],
            'age_phase' => ['nullable', 'string', 'max:100'],
            'deviceId' => ['nullable', 'string', 'max:255'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'extra_metadata' => ['nullable', 'array'],
        ]);

        $deviceId = $request->input('deviceId') ?? $request->input('device_id');
        $educationLevel = $request->input('educationLevel') ?? $request->input('education_level');
        $educationClass = $request->input('educationClass') ?? $request->input('education_class');
        $gorontaloFrequency = $request->input('gorontaloFrequency') ?? $request->input('gorontalo_frequency');
        $appGoal = $request->input('appGoal') ?? $request->input('app_goal');
        $agePhase = $request->input('agePhase') ?? $request->input('age_phase');

        $attributes = [
            'name' => $validated['name'],
            'age' => $validated['age'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'education_level' => $educationLevel,
            'education_class' => $educationClass,
            'gorontalo_frequency' => $gorontaloFrequency,
            'app_goal' => $appGoal,
            'age_phase' => $agePhase,
            'device_id' => $deviceId,
            'extra_metadata' => $request->input('extra_metadata'),
        ];

        if ($deviceId) {
            $user = AppUser::updateOrCreate(['device_id' => $deviceId], $attributes);
        } else {
            $user = AppUser::create($attributes);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User monitoring data saved successfully',
            'data' => [
                'id' => $user->id,
                'user_id' => $user->id,
                'device_id' => $user->device_id,
                'name' => $user->name,
                'created_at' => $user->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Helper to parse video duration seconds safely from various aliases and units.
     */
    private function parseDurationSeconds(mixed $value, bool $isCompleted = false): int
    {
        if ($value === null || $value === '') {
            return $isCompleted ? 10 : 0;
        }

        if (is_numeric($value)) {
            $num = (float) $value;
            // If value is >= 1000 and sent in milliseconds from Android (e.g. 10000ms = 10s)
            if ($num >= 1000) {
                $num = $num / 1000;
            }
            $res = (int) round($num);
            if ($res <= 0 && $isCompleted) {
                return 10;
            }
            return max(0, $res);
        }

        return $isCompleted ? 10 : 0;
    }

    /**
     * Helper to parse audio dubbing duration safely.
     */
    private function parseAudioDurationSeconds(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            $num = (float) $value;
            if ($num >= 1000) {
                $num = $num / 1000;
            }
            return round($num, 1);
        }

        return null;
    }

    /**
     * Log a video play event per story and scene.
     */
    public function logVideoPlay(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer'],
            'app_user_id' => ['nullable', 'integer'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'deviceId' => ['nullable', 'string', 'max:255'],
            'story_id' => ['nullable', 'integer'],
            'story_title' => ['nullable', 'string', 'max:255'],
            'storyTitle' => ['nullable', 'string', 'max:255'],
            'scene_id' => ['nullable', 'integer'],
            'scene_title' => ['nullable', 'string', 'max:255'],
            'sceneTitle' => ['nullable', 'string', 'max:255'],
            'video_name' => ['nullable', 'string', 'max:255'],
            'videoName' => ['nullable', 'string', 'max:255'],
            'duration_seconds' => ['nullable'],
            'durationSeconds' => ['nullable'],
            'duration' => ['nullable'],
            'is_completed' => ['nullable'],
            'isCompleted' => ['nullable'],
            'played_at' => ['nullable'],
            'playedAt' => ['nullable'],
        ]);

        $userId = $request->input('app_user_id') ?? $request->input('user_id');
        $deviceId = $request->input('device_id') ?? $request->input('deviceId');
        $storyTitle = $request->input('story_title') ?? $request->input('storyTitle') ?? 'Cerita Rakyat';
        $sceneTitle = $request->input('scene_title') ?? $request->input('sceneTitle') ?? 'Scene Animasi';
        $videoName = $request->input('video_name') ?? $request->input('videoName');

        $isCompleted = (bool) ($request->input('is_completed') ?? $request->input('isCompleted') ?? false);
        $rawDuration = $request->input('duration_seconds')
            ?? $request->input('durationSeconds')
            ?? $request->input('duration')
            ?? $request->input('video_duration')
            ?? $request->input('videoDuration');
        $durationSeconds = $this->parseDurationSeconds($rawDuration, $isCompleted);

        $playedAtRaw = $request->input('played_at') ?? $request->input('playedAt');

        if (! $userId && $deviceId) {
            $appUser = AppUser::where('device_id', $deviceId)->first();
            if ($appUser) {
                $userId = $appUser->id;
            }
        }

        $log = VideoPlayLog::create([
            'app_user_id' => $userId,
            'device_id' => $deviceId,
            'story_id' => $request->input('story_id'),
            'story_title' => $storyTitle,
            'scene_id' => $request->input('scene_id'),
            'scene_title' => $sceneTitle,
            'video_name' => $videoName,
            'duration_seconds' => $durationSeconds,
            'is_completed' => $isCompleted,
            'played_at' => ! empty($playedAtRaw) ? Carbon::parse($playedAtRaw) : now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Video play logged successfully',
            'data' => [
                'log_id' => $log->id,
                'story_title' => $log->story_title,
                'scene_title' => $log->scene_title,
                'duration_seconds' => $log->duration_seconds,
                'played_at' => $log->played_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Log an interactivity event where a user records / replaces voice in a story scene.
     */
    public function logVoiceReplacement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer'],
            'app_user_id' => ['nullable', 'integer'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'deviceId' => ['nullable', 'string', 'max:255'],
            'story_id' => ['nullable', 'integer'],
            'story_title' => ['nullable', 'string', 'max:255'],
            'storyTitle' => ['nullable', 'string', 'max:255'],
            'scene_id' => ['nullable', 'integer'],
            'scene_title' => ['nullable', 'string', 'max:255'],
            'sceneTitle' => ['nullable', 'string', 'max:255'],
            'action_type' => ['nullable', 'string', 'max:50'],
            'actionType' => ['nullable', 'string', 'max:50'],
            'replacement_count' => ['nullable'],
            'replacementCount' => ['nullable'],
            'audio_duration_seconds' => ['nullable'],
            'audioDurationSeconds' => ['nullable'],
            'audio_duration' => ['nullable'],
            'duration_seconds' => ['nullable'],
            'durationSeconds' => ['nullable'],
            'recorded_at' => ['nullable'],
            'recordedAt' => ['nullable'],
        ]);

        $userId = $request->input('app_user_id') ?? $request->input('user_id');
        $deviceId = $request->input('device_id') ?? $request->input('deviceId');
        $storyTitle = $request->input('story_title') ?? $request->input('storyTitle') ?? 'Cerita Rakyat';
        $sceneTitle = $request->input('scene_title') ?? $request->input('sceneTitle') ?? 'Scene Dubbing';
        $actionType = $request->input('action_type') ?? $request->input('actionType') ?? 'replaced';

        $replacementCount = (int) ($request->input('replacement_count')
            ?? $request->input('replacementCount')
            ?? $request->input('count')
            ?? 1);

        $rawAudioDuration = $request->input('audio_duration_seconds')
            ?? $request->input('audioDurationSeconds')
            ?? $request->input('audio_duration')
            ?? $request->input('audioDuration')
            ?? $request->input('duration_seconds')
            ?? $request->input('durationSeconds');
        $audioDurationSeconds = $this->parseAudioDurationSeconds($rawAudioDuration);

        $recordedAtRaw = $request->input('recorded_at') ?? $request->input('recordedAt');

        if (! $userId && $deviceId) {
            $appUser = AppUser::where('device_id', $deviceId)->first();
            if ($appUser) {
                $userId = $appUser->id;
            }
        }

        $log = VoiceReplacementLog::create([
            'app_user_id' => $userId,
            'device_id' => $deviceId,
            'story_id' => $request->input('story_id'),
            'story_title' => $storyTitle,
            'scene_id' => $request->input('scene_id'),
            'scene_title' => $sceneTitle,
            'action_type' => $actionType,
            'replacement_count' => max(1, $replacementCount),
            'audio_duration_seconds' => $audioDurationSeconds,
            'recorded_at' => ! empty($recordedAtRaw) ? Carbon::parse($recordedAtRaw) : now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Voice replacement logged successfully',
            'data' => [
                'log_id' => $log->id,
                'story_title' => $log->story_title,
                'scene_title' => $log->scene_title,
                'replacement_count' => $log->replacement_count,
                'audio_duration_seconds' => $log->audio_duration_seconds,
                'recorded_at' => $log->recorded_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Batch synchronization endpoint for offline-to-online sync from Android.
     */
    public function syncBatch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user' => ['nullable', 'array'],
            'user.name' => ['nullable', 'string', 'max:255'],
            'user.deviceId' => ['nullable', 'string'],
            'user.device_id' => ['nullable', 'string'],
            'video_plays' => ['nullable', 'array'],
            'videoPlays' => ['nullable', 'array'],
            'voice_replacements' => ['nullable', 'array'],
            'voiceReplacements' => ['nullable', 'array'],
        ]);

        return DB::transaction(function () use ($request) {
            $userId = null;
            $deviceId = null;

            if ($request->has('user') && ! empty($request->input('user.name'))) {
                $userData = $request->input('user');
                $deviceId = $userData['deviceId'] ?? $userData['device_id'] ?? null;
                $educationLevel = $userData['educationLevel'] ?? $userData['education_level'] ?? null;
                $educationClass = $userData['educationClass'] ?? $userData['education_class'] ?? null;
                $gorontaloFrequency = $userData['gorontaloFrequency'] ?? $userData['gorontalo_frequency'] ?? null;
                $appGoal = $userData['appGoal'] ?? $userData['app_goal'] ?? null;
                $agePhase = $userData['agePhase'] ?? $userData['age_phase'] ?? null;

                $userAttrs = [
                    'name' => $userData['name'],
                    'age' => $userData['age'] ?? null,
                    'gender' => $userData['gender'] ?? null,
                    'education_level' => $educationLevel,
                    'education_class' => $educationClass,
                    'gorontalo_frequency' => $gorontaloFrequency,
                    'app_goal' => $appGoal,
                    'age_phase' => $agePhase,
                    'device_id' => $deviceId,
                ];

                if ($deviceId) {
                    $user = AppUser::updateOrCreate(['device_id' => $deviceId], $userAttrs);
                } else {
                    $user = AppUser::create($userAttrs);
                }
                $userId = $user->id;
            }

            $savedPlays = 0;
            $videoPlaysList = $request->input('video_plays') ?? $request->input('videoPlays');
            if (is_array($videoPlaysList)) {
                foreach ($videoPlaysList as $play) {
                    $storyTitle = $play['story_title'] ?? $play['storyTitle'] ?? null;
                    $sceneTitle = $play['scene_title'] ?? $play['sceneTitle'] ?? null;
                    if (empty($storyTitle) || empty($sceneTitle)) {
                        continue;
                    }

                    $isCompleted = (bool) ($play['is_completed'] ?? $play['isCompleted'] ?? false);
                    $rawDuration = $play['duration_seconds']
                        ?? $play['durationSeconds']
                        ?? $play['duration']
                        ?? $play['video_duration']
                        ?? $play['videoDuration']
                        ?? null;
                    $durationSeconds = $this->parseDurationSeconds($rawDuration, $isCompleted);
                    $playedAtRaw = $play['played_at'] ?? $play['playedAt'] ?? null;

                    VideoPlayLog::create([
                        'app_user_id' => $userId ?? $play['user_id'] ?? $play['app_user_id'] ?? null,
                        'device_id' => $deviceId ?? $play['device_id'] ?? $play['deviceId'] ?? null,
                        'story_id' => $play['story_id'] ?? $play['storyId'] ?? null,
                        'story_title' => $storyTitle,
                        'scene_id' => $play['scene_id'] ?? $play['sceneId'] ?? null,
                        'scene_title' => $sceneTitle,
                        'video_name' => $play['video_name'] ?? $play['videoName'] ?? null,
                        'duration_seconds' => $durationSeconds,
                        'is_completed' => $isCompleted,
                        'played_at' => ! empty($playedAtRaw) ? Carbon::parse($playedAtRaw) : now(),
                    ]);
                    $savedPlays++;
                }
            }

            $savedReplacements = 0;
            $voiceList = $request->input('voice_replacements') ?? $request->input('voiceReplacements');
            if (is_array($voiceList)) {
                foreach ($voiceList as $voice) {
                    $storyTitle = $voice['story_title'] ?? $voice['storyTitle'] ?? null;
                    $sceneTitle = $voice['scene_title'] ?? $voice['sceneTitle'] ?? null;
                    if (empty($storyTitle) || empty($sceneTitle)) {
                        continue;
                    }

                    $replacementCount = (int) ($voice['replacement_count']
                        ?? $voice['replacementCount']
                        ?? $voice['count']
                        ?? 1);

                    $rawAudioDuration = $voice['audio_duration_seconds']
                        ?? $voice['audioDurationSeconds']
                        ?? $voice['audio_duration']
                        ?? $voice['audioDuration']
                        ?? $voice['duration_seconds']
                        ?? $voice['durationSeconds']
                        ?? null;
                    $audioDurationSeconds = $this->parseAudioDurationSeconds($rawAudioDuration);
                    $recordedAtRaw = $voice['recorded_at'] ?? $voice['recordedAt'] ?? null;

                    VoiceReplacementLog::create([
                        'app_user_id' => $userId ?? $voice['user_id'] ?? $voice['app_user_id'] ?? null,
                        'device_id' => $deviceId ?? $voice['device_id'] ?? $voice['deviceId'] ?? null,
                        'story_id' => $voice['story_id'] ?? $voice['storyId'] ?? null,
                        'story_title' => $storyTitle,
                        'scene_id' => $voice['scene_id'] ?? $voice['sceneId'] ?? null,
                        'scene_title' => $sceneTitle,
                        'action_type' => $voice['action_type'] ?? $voice['actionType'] ?? 'replaced',
                        'replacement_count' => max(1, $replacementCount),
                        'audio_duration_seconds' => $audioDurationSeconds,
                        'recorded_at' => ! empty($recordedAtRaw) ? Carbon::parse($recordedAtRaw) : now(),
                    ]);
                    $savedReplacements++;
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Batch monitoring data synced successfully',
                'data' => [
                    'user_id' => $userId,
                    'synced_video_plays' => $savedPlays,
                    'synced_voice_replacements' => $savedReplacements,
                    'synced_at' => now()->toIso8601String(),
                ],
            ]);
        });
    }

    /**
     * Get list of stories and scenes for the Android app.
     */
    public function getStories(): JsonResponse
    {
        $stories = Story::with(['scenes'])->orderBy('id')->get();

        $formatted = $stories->map(function (Story $story) {
            $storyCode = $story->story_code ?: ('story_' . $story->id);
            $zipPath = storage_path('app/public/packages/' . $storyCode . '.zip');

            $sizeBytes = file_exists($zipPath)
                ? filesize($zipPath)
                : ($story->download_size_bytes ?: 15728640);

            $downloadUrl = $story->download_package_url
                ? url($story->download_package_url)
                : url('/storage/packages/' . $storyCode . '.zip');

            $coverUrl = $story->cover_image
                ? url('/storage/covers/' . $story->cover_image)
                : ($story->thumbnail ? url($story->thumbnail) : null);

            $backsoundUrl = $story->backsound_file
                ? url('/storage/packages/' . $story->backsound_file)
                : null;

            $formattedScenes = $story->scenes->map(function (Scene $scene) {
                return [
                    'id' => $scene->id,
                    'sceneNumber' => $scene->scene_number,
                    'scene_number' => $scene->scene_number,
                    'title' => $scene->title,
                    'videoMuteFile' => $scene->video_mute_file ?: $scene->video_asset,
                    'video_mute_file' => $scene->video_mute_file ?: $scene->video_asset,
                    'audioOriginalFile' => $scene->audio_original_file,
                    'audio_original_file' => $scene->audio_original_file,
                    'characterName' => $scene->character_name,
                    'character_name' => $scene->character_name,
                    'gorontaloScript' => $scene->gorontalo_script,
                    'gorontalo_script' => $scene->gorontalo_script,
                    'indonesianTranslation' => $scene->indonesian_translation,
                    'indonesian_translation' => $scene->indonesian_translation,
                    'dialogues' => $scene->dialogues ?: [],
                ];
            });

            // Format download size into human-readable string (e.g. "15 MB" or "940 KB")
            $sizeFormatted = $sizeBytes >= 1048576
                ? round($sizeBytes / 1048576, 1) . ' MB'
                : round($sizeBytes / 1024, 1) . ' KB';

            return [
                'id' => $story->id,
                'storyId' => $storyCode,
                'story_id' => $storyCode,
                'slug' => $story->slug,
                'title' => $story->title,
                'fase' => $story->fase ?: 'Fase A',
                'category' => $story->category,
                'description' => $story->description,
                'coverImage' => $story->cover_image ?: 'cover_' . $story->slug,
                'cover_image' => $story->cover_image,
                'cover_url' => $coverUrl,
                'backsoundFile' => $story->backsound_file,
                'backsound_file' => $story->backsound_file,
                'backsound_url' => $backsoundUrl,
                'downloadPackageUrl' => $downloadUrl,
                'download_package_url' => $downloadUrl,
                'downloadSizeBytes' => $sizeBytes,
                'download_size_bytes' => $sizeBytes,
                'downloadSizeFormatted' => $sizeFormatted,
                'download_size_formatted' => $sizeFormatted,
                'totalScenes' => $story->scenes->count(),
                'total_scenes' => $story->scenes->count(),
                'scenes' => $formattedScenes,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formatted,
        ]);
    }

    /**
     * Quick status check and overview stats for the API.
     */
    public function getSummary(): JsonResponse
    {
        return response()->json([
            'status' => 'online',
            'app_name' => 'Donggo Animation & Voice Dubbing Monitoring API',
            'version' => '1.0.0',
            'counts' => [
                'users' => AppUser::count(),
                'video_plays' => VideoPlayLog::count(),
                'voice_replacements' => VoiceReplacementLog::sum('replacement_count') ?: VoiceReplacementLog::count(),
                'stories' => Story::count(),
                'scenes' => Scene::count(),
            ],
            'server_time' => now()->toIso8601String(),
        ]);
    }
}
