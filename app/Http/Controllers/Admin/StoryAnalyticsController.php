<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scene;
use App\Models\Story;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StoryAnalyticsController extends Controller
{
    /**
     * Display story and scene analytics matrix.
     */
    public function index(Request $request): Response
    {
        $stories = Story::with(['scenes' => function ($q) {
            $q->orderBy('scene_number');
        }])->get();

        // Calculate analytics per story
        $storyStats = $stories->map(function ($story) {
            $storyTitle = $story->title;

            $totalPlays = VideoPlayLog::where('story_title', $storyTitle)->count();
            $totalDubbings = (int) VoiceReplacementLog::where('story_title', $storyTitle)->sum('replacement_count');
            $uniqueLearners = VideoPlayLog::where('story_title', $storyTitle)
                ->distinct('app_user_id')
                ->count('app_user_id');

            $scenesData = $story->scenes->map(function ($scene) use ($storyTitle) {
                $scenePlays = VideoPlayLog::where('story_title', $storyTitle)
                    ->where('scene_title', $scene->title)
                    ->count();

                $sceneDubbings = (int) VoiceReplacementLog::where('story_title', $storyTitle)
                    ->where('scene_title', $scene->title)
                    ->sum('replacement_count');

                $activeDubbers = VoiceReplacementLog::where('story_title', $storyTitle)
                    ->where('scene_title', $scene->title)
                    ->distinct('app_user_id')
                    ->count('app_user_id');

                return [
                    'id' => $scene->id,
                    'scene_number' => $scene->scene_number,
                    'title' => $scene->title,
                    'character_name' => $scene->character_name,
                    'gorontalo_script' => $scene->gorontalo_script,
                    'indonesian_translation' => $scene->indonesian_translation,
                    'video_asset' => $scene->video_asset,
                    'total_plays' => $scenePlays,
                    'total_dubbings' => $sceneDubbings,
                    'active_learners' => $activeDubbers,
                ];
            });

            return [
                'id' => $story->id,
                'title' => $story->title,
                'slug' => $story->slug,
                'category' => $story->category,
                'description' => $story->description,
                'total_scenes' => $story->scenes->count(),
                'total_plays' => $totalPlays,
                'total_dubbings' => $totalDubbings,
                'unique_learners' => $uniqueLearners,
                'scenes' => $scenesData,
            ];
        });

        return Inertia::render('admin/stories/index', [
            'stories' => $storyStats,
        ]);
    }
}
