<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scene;
use App\Models\Story;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use ZipArchive;

class StoryManagementController extends Controller
{
    /**
     * Display the stories catalog, media management, and scene breakdown.
     */
    public function index(Request $request): Response
    {
        $stories = Story::with(['scenes' => function ($query) {
            $query->orderBy('scene_number');
        }])->orderBy('id')->get();

        $packagesDir = storage_path('app/public/packages');
        $coversDir = storage_path('app/public/covers');

        // Available files on physical disk
        $availableCovers = [];
        if (File::exists($coversDir)) {
            $coverFiles = File::files($coversDir);
            foreach ($coverFiles as $file) {
                $availableCovers[] = [
                    'name' => $file->getFilename(),
                    'size' => $file->getSize(),
                    'url' => url('/storage/covers/' . $file->getFilename()),
                ];
            }
        }

        $availablePackages = [];
        if (File::exists($packagesDir)) {
            $packageFiles = File::files($packagesDir);
            foreach ($packageFiles as $file) {
                if ($file->getExtension() === 'zip') {
                    $availablePackages[] = [
                        'name' => $file->getFilename(),
                        'size' => $file->getSize(),
                        'formatted_size' => $this->formatBytes($file->getSize()),
                        'url' => url('/storage/packages/' . $file->getFilename()),
                    ];
                }
            }
        }

        // Prepare story list with file existence and analytics
        $formattedStories = $stories->map(function (Story $story) use ($packagesDir, $coversDir) {
            $storyCode = $story->story_code ?: ('story_' . $story->id);
            $zipFilename = $storyCode . '.zip';
            $zipPath = $packagesDir . DIRECTORY_SEPARATOR . $zipFilename;
            $zipExists = File::exists($zipPath);

            $coverFilename = $story->cover_image;
            $coverPath = $coverFilename ? ($coversDir . DIRECTORY_SEPARATOR . $coverFilename) : null;
            $coverExists = $coverPath && File::exists($coverPath);

            $totalPlays = VideoPlayLog::where('story_title', $story->title)
                ->orWhere('story_id', $story->id)
                ->count();

            $totalDubbings = (int) VoiceReplacementLog::where('story_title', $story->title)
                ->orWhere('story_id', $story->id)
                ->sum('replacement_count');

            $uniqueLearners = VideoPlayLog::where('story_title', $story->title)
                ->orWhere('story_id', $story->id)
                ->distinct('app_user_id')
                ->count('app_user_id');

            $coverUrl = $coverExists
                ? url('/storage/covers/' . $coverFilename)
                : ($story->thumbnail ? url($story->thumbnail) : null);

            $downloadUrl = $zipExists
                ? url('/storage/packages/' . $zipFilename)
                : ($story->download_package_url ? url($story->download_package_url) : null);

            $sizeBytes = $zipExists ? File::size($zipPath) : ($story->download_size_bytes ?? 0);

            $scenes = $story->scenes->map(function (Scene $scene) use ($story) {
                $scenePlays = VideoPlayLog::where(function ($q) use ($story, $scene) {
                    $q->where('scene_id', $scene->id)
                      ->orWhere(function ($q2) use ($story, $scene) {
                          $q2->where('story_title', $story->title)
                             ->where('scene_title', $scene->title);
                      });
                })->count();

                $sceneDubbings = (int) VoiceReplacementLog::where(function ($q) use ($story, $scene) {
                    $q->where('scene_id', $scene->id)
                      ->orWhere(function ($q2) use ($story, $scene) {
                          $q2->where('story_title', $story->title)
                             ->where('scene_title', $scene->title);
                      });
                })->sum('replacement_count');

                return [
                    'id' => $scene->id,
                    'story_id' => $scene->story_id,
                    'scene_number' => $scene->scene_number,
                    'title' => $scene->title,
                    'character_name' => $scene->character_name,
                    'gorontalo_script' => $scene->gorontalo_script,
                    'indonesian_translation' => $scene->indonesian_translation,
                    'video_asset' => $scene->video_asset,
                    'video_mute_file' => $scene->video_mute_file ?: $scene->video_asset,
                    'audio_original_file' => $scene->audio_original_file,
                    'dialogues' => $scene->dialogues ?: [],
                    'total_plays' => $scenePlays,
                    'total_dubbings' => $sceneDubbings,
                ];
            });

            return [
                'id' => $story->id,
                'story_code' => $storyCode,
                'slug' => $story->slug,
                'title' => $story->title,
                'category' => $story->category,
                'fase' => $story->fase ?: 'Fase A',
                'description' => $story->description,
                'cover_image' => $story->cover_image,
                'cover_url' => $coverUrl,
                'cover_exists' => $coverExists,
                'thumbnail' => $story->thumbnail,
                'backsound_file' => $story->backsound_file,
                'download_package_url' => $downloadUrl,
                'download_size_bytes' => $sizeBytes,
                'download_size_formatted' => $this->formatBytes($sizeBytes),
                'zip_exists' => $zipExists,
                'total_scenes' => $scenes->count(),
                'total_plays' => $totalPlays,
                'total_dubbings' => $totalDubbings,
                'unique_learners' => $uniqueLearners,
                'scenes' => $scenes,
            ];
        });

        return Inertia::render('admin/stories/index', [
            'stories' => $formattedStories,
            'availableCovers' => $availableCovers,
            'availablePackages' => $availablePackages,
            'storageStatus' => [
                'coversDirExists' => File::exists($coversDir),
                'packagesDirExists' => File::exists($packagesDir),
                'totalPhysicalCovers' => count($availableCovers),
                'totalPhysicalPackages' => count($availablePackages),
            ],
        ]);
    }

    /**
     * Store a newly created story with optional cover image and ZIP package upload.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'story_code' => ['nullable', 'string', 'max:50'],
            'slug' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'fase' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'cover_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:20480'], // max 20MB
            'existing_cover' => ['nullable', 'string', 'max:255'],
            'package_file' => ['nullable', 'file', 'mimes:zip', 'max:524288'], // max 512MB
            'existing_package' => ['nullable', 'string', 'max:255'],
            'backsound_file' => ['nullable', 'string', 'max:255'],
        ]);

        $storyCode = $validated['story_code'] ?? null;
        if (empty($storyCode)) {
            $nextId = (Story::max('id') ?? 0) + 1;
            $storyCode = 'story_' . $nextId;
        }
        $storyCode = Str::slug($storyCode, '_');

        $slug = $validated['slug'] ?? null;
        if (empty($slug)) {
            $slug = Str::slug($validated['title']);
        }

        // Ensure unique slug
        $baseSlug = $slug;
        $counter = 1;
        while (Story::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $coverImage = $validated['existing_cover'] ?? null;
        if ($request->hasFile('cover_file')) {
            $coverFile = $request->file('cover_file');
            $ext = $coverFile->getClientOriginalExtension();
            $filename = 'cover_' . Str::slug($validated['title'], '_') . '.' . $ext;

            $coversDir = storage_path('app/public/covers');
            if (! File::exists($coversDir)) {
                File::makeDirectory($coversDir, 0755, true);
            }
            $coverFile->move($coversDir, $filename);
            $coverImage = $filename;
        }

        $packageUrl = null;
        $packageSizeBytes = 0;

        if ($request->hasFile('package_file')) {
            $packageFile = $request->file('package_file');
            $packagesDir = storage_path('app/public/packages');
            if (! File::exists($packagesDir)) {
                File::makeDirectory($packagesDir, 0755, true);
            }

            $zipFilename = $storyCode . '.zip';
            $packageSizeBytes = $packageFile->getSize();
            $packageFile->move($packagesDir, $zipFilename);

            $packageUrl = '/storage/packages/' . $zipFilename;
        } elseif (! empty($validated['existing_package'])) {
            $packagesDir = storage_path('app/public/packages');
            $zipPath = $packagesDir . DIRECTORY_SEPARATOR . $validated['existing_package'];
            if (File::exists($zipPath)) {
                $packageSizeBytes = File::size($zipPath);
            }
            $packageUrl = '/storage/packages/' . $validated['existing_package'];
        }

        $story = Story::create([
            'story_code' => $storyCode,
            'slug' => $slug,
            'title' => $validated['title'],
            'category' => $validated['category'],
            'fase' => $validated['fase'] ?? 'Fase A',
            'description' => $validated['description'] ?? null,
            'cover_image' => $coverImage,
            'thumbnail' => $coverImage ? ('/storage/covers/' . $coverImage) : null,
            'backsound_file' => $validated['backsound_file'] ?? null,
            'download_package_url' => $packageUrl,
            'download_size_bytes' => $packageSizeBytes,
            'total_scenes' => 0,
        ]);

        return redirect()->route('admin.stories.index')
            ->with('success', "Cerita '{$story->title}' berhasil ditambahkan.");
    }

    /**
     * Update an existing story and handle cover/package replacement.
     */
    public function update(Request $request, Story $story): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'story_code' => ['nullable', 'string', 'max:50'],
            'slug' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'fase' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'cover_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:20480'],
            'existing_cover' => ['nullable', 'string', 'max:255'],
            'package_file' => ['nullable', 'file', 'mimes:zip', 'max:524288'],
            'existing_package' => ['nullable', 'string', 'max:255'],
            'backsound_file' => ['nullable', 'string', 'max:255'],
        ]);

        $storyCode = $validated['story_code'] ?? $story->story_code ?: ('story_' . $story->id);
        $storyCode = Str::slug($storyCode, '_');

        $slug = $validated['slug'] ?? $story->slug;
        if (empty($slug)) {
            $slug = Str::slug($validated['title']);
        }

        // Ensure unique slug excluding current story
        $baseSlug = $slug;
        $counter = 1;
        while (Story::where('slug', $slug)->where('id', '!=', $story->id)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $coverImage = $story->cover_image;

        if ($request->hasFile('cover_file')) {
            $coverFile = $request->file('cover_file');
            $ext = $coverFile->getClientOriginalExtension();
            $filename = 'cover_' . Str::slug($validated['title'], '_') . '_' . time() . '.' . $ext;

            $coversDir = storage_path('app/public/covers');
            if (! File::exists($coversDir)) {
                File::makeDirectory($coversDir, 0755, true);
            }

            $coverFile->move($coversDir, $filename);
            $coverImage = $filename;
        } elseif (! empty($validated['existing_cover'])) {
            $coverImage = $validated['existing_cover'];
        }

        $packageUrl = $story->download_package_url;
        $packageSizeBytes = $story->download_size_bytes;

        if ($request->hasFile('package_file')) {
            $packageFile = $request->file('package_file');
            $packagesDir = storage_path('app/public/packages');
            if (! File::exists($packagesDir)) {
                File::makeDirectory($packagesDir, 0755, true);
            }

            $zipFilename = $storyCode . '.zip';
            $packageSizeBytes = $packageFile->getSize();
            $packageFile->move($packagesDir, $zipFilename);

            $packageUrl = '/storage/packages/' . $zipFilename;
        } elseif (! empty($validated['existing_package'])) {
            $packagesDir = storage_path('app/public/packages');
            $zipPath = $packagesDir . DIRECTORY_SEPARATOR . $validated['existing_package'];
            if (File::exists($zipPath)) {
                $packageSizeBytes = File::size($zipPath);
            }
            $packageUrl = '/storage/packages/' . $validated['existing_package'];
        }

        $story->update([
            'story_code' => $storyCode,
            'slug' => $slug,
            'title' => $validated['title'],
            'category' => $validated['category'],
            'fase' => $validated['fase'] ?? 'Fase A',
            'description' => $validated['description'] ?? null,
            'cover_image' => $coverImage,
            'thumbnail' => $coverImage ? ('/storage/covers/' . $coverImage) : $story->thumbnail,
            'backsound_file' => $validated['backsound_file'] ?? $story->backsound_file,
            'download_package_url' => $packageUrl,
            'download_size_bytes' => $packageSizeBytes,
            'total_scenes' => $story->scenes()->count(),
        ]);

        return redirect()->route('admin.stories.index')
            ->with('success', "Cerita '{$story->title}' berhasil diperbarui.");
    }

    /**
     * Delete a story and its scenes.
     */
    public function destroy(Story $story): RedirectResponse
    {
        $title = $story->title;
        $story->scenes()->delete();
        $story->delete();

        return redirect()->route('admin.stories.index')
            ->with('success', "Cerita '{$title}' dan seluruh adegannya berhasil dihapus.");
    }

    /**
     * Add a scene to a story.
     */
    public function storeScene(Request $request, Story $story): RedirectResponse
    {
        $validated = $request->validate([
            'scene_number' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'character_name' => ['nullable', 'string', 'max:100'],
            'gorontalo_script' => ['nullable', 'string'],
            'indonesian_translation' => ['nullable', 'string'],
            'video_asset' => ['nullable', 'string', 'max:255'],
            'video_mute_file' => ['nullable', 'string', 'max:255'],
            'audio_original_file' => ['nullable', 'string', 'max:255'],
            'dialogues' => ['nullable', 'array'],
        ]);

        $videoFile = $validated['video_mute_file'] ?? $validated['video_asset'] ?? null;
        if (empty($videoFile)) {
            $storyCode = $story->story_code ?: ('story_' . $story->id);
            $videoFile = "{$storyCode}_scene_{$validated['scene_number']}_video_mute.mp4";
        }

        $audioFile = $validated['audio_original_file'] ?? null;
        if (empty($audioFile)) {
            $storyCode = $story->story_code ?: ('story_' . $story->id);
            $audioFile = "{$storyCode}_scene_{$validated['scene_number']}_audio.wav";
        }

        Scene::create([
            'story_id' => $story->id,
            'scene_number' => $validated['scene_number'],
            'title' => $validated['title'],
            'character_name' => $validated['character_name'] ?? null,
            'gorontalo_script' => $validated['gorontalo_script'] ?? null,
            'indonesian_translation' => $validated['indonesian_translation'] ?? null,
            'video_asset' => $videoFile,
            'video_mute_file' => $videoFile,
            'audio_original_file' => $audioFile,
            'dialogues' => $validated['dialogues'] ?? [],
        ]);

        $story->update(['total_scenes' => $story->scenes()->count()]);

        return redirect()->route('admin.stories.index')
            ->with('success', "Adegan '{$validated['title']}' berhasil ditambahkan ke {$story->title}.");
    }

    /**
     * Update an existing scene.
     */
    public function updateScene(Request $request, Story $story, Scene $scene): RedirectResponse
    {
        $validated = $request->validate([
            'scene_number' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'character_name' => ['nullable', 'string', 'max:100'],
            'gorontalo_script' => ['nullable', 'string'],
            'indonesian_translation' => ['nullable', 'string'],
            'video_mute_file' => ['nullable', 'string', 'max:255'],
            'audio_original_file' => ['nullable', 'string', 'max:255'],
            'dialogues' => ['nullable', 'array'],
        ]);

        $scene->update([
            'scene_number' => $validated['scene_number'],
            'title' => $validated['title'],
            'character_name' => $validated['character_name'] ?? null,
            'gorontalo_script' => $validated['gorontalo_script'] ?? null,
            'indonesian_translation' => $validated['indonesian_translation'] ?? null,
            'video_asset' => $validated['video_mute_file'] ?? $scene->video_asset,
            'video_mute_file' => $validated['video_mute_file'] ?? $scene->video_mute_file,
            'audio_original_file' => $validated['audio_original_file'] ?? $scene->audio_original_file,
            'dialogues' => $validated['dialogues'] ?? $scene->dialogues,
        ]);

        return redirect()->route('admin.stories.index')
            ->with('success', "Adegan #{$scene->scene_number} berhasil diperbarui.");
    }

    /**
     * Delete a scene.
     */
    public function destroyScene(Story $story, Scene $scene): RedirectResponse
    {
        $sceneNumber = $scene->scene_number;
        $scene->delete();

        $story->update(['total_scenes' => $story->scenes()->count()]);

        return redirect()->route('admin.stories.index')
            ->with('success', "Adegan #{$sceneNumber} berhasil dihapus.");
    }

    /**
     * 1-Click Sync: Scan physical files in storage/app/public/packages and covers,
     * and automatically sync with the 6 real stories and scenes.
     */
    public function syncStorageAssets(): RedirectResponse
    {
        $packagesDir = storage_path('app/public/packages');
        $coversDir = storage_path('app/public/covers');

        // Master definitions for the 6 real Gorontalo stories matching physical files
        $realStoriesCatalog = [
            'story_1' => [
                'title' => 'Hemolapula lo Putito',
                'slug' => 'hemolapula-lo-putito',
                'category' => 'Cerita Rakyat Gorontalo',
                'fase' => 'Fase A',
                'description' => 'Kisah persahabatan dan kecerdikan kancil dan kera dalam cerita rakyat Gorontalo Hemolapula lo Putito.',
                'cover_pattern' => 'cover_hemolapula_lo_putito',
                'backsound_file' => 'backsound_story_1.mp3',
            ],
            'story_2' => [
                'title' => 'Dulo Yimindalalo',
                'slug' => 'dulo-yimindalalo',
                'category' => 'Cerita Rakyat Gorontalo',
                'fase' => 'Fase B',
                'description' => 'Kisah kearifan lokal Gorontalo tentang kerja sama, kebersamaan, dan keharmonisan hidup dalam Dulo Yimindalalo.',
                'cover_pattern' => 'cover_dulo_yimindalalo',
                'backsound_file' => 'backsound_story_2.mp3',
            ],
            'story_3' => [
                'title' => 'Mongoponula li Timayo',
                'slug' => 'mongoponula-li-timayo',
                'category' => 'Cerita Rakyat Gorontalo',
                'fase' => 'Fase C',
                'description' => 'Kisah petualangan dan keteladanan pemuda Gorontalo dalam Mongoponula li Timayo yang sarat nilai budi pekerti luhur.',
                'cover_pattern' => 'cover_mongoponula_li_timayo',
                'backsound_file' => 'backsound_story_3.mp3',
            ],
            'story_4' => [
                'title' => "Wala'o Tuturuga",
                'slug' => 'walao-tuturuga',
                'category' => 'Fabel & Cerita Binatang',
                'fase' => 'Fase A',
                'description' => 'Dongeng fabel Gorontalo tentang anak kura-kura yang sabar dan bijaksana dalam menghadapi berbagai rintangan kehidupan.',
                'cover_pattern' => 'cover_walao_tuturuga',
                'backsound_file' => 'backsound_story_4.mp3',
            ],
            'story_5' => [
                'title' => 'Yilongola Cici Hiyongo',
                'slug' => 'yilongola-cici-hiyongo',
                'category' => 'Cerita Rakyat Gorontalo',
                'fase' => 'Fase B',
                'description' => 'Kisah rakyat Gorontalo mengenai keceriaan, kasih sayang persaudaraan, dan ketabahan dalam keluarga.',
                'cover_pattern' => 'cover_yilongola_cici_hiyongo',
                'backsound_file' => 'backsound_story_5.mp3',
            ],
            'story_6' => [
                'title' => 'Doremi lo Hulontalo',
                'slug' => 'doremi-lo-hulontalo',
                'category' => 'Lagu & Nada Edukatif',
                'fase' => 'Fase A',
                'description' => 'Nyanyian edukatif pengenalan nada dan kosa kata bahasa Gorontalo yang menyenangkan bagi anak-anak.',
                'cover_pattern' => 'cover_doremi',
                'backsound_file' => 'backsound_story_6.mp3',
            ],
        ];

        // List actual cover files
        $actualCovers = [];
        if (File::exists($coversDir)) {
            foreach (File::files($coversDir) as $f) {
                $actualCovers[] = $f->getFilename();
            }
        }

        $syncedStories = 0;
        $syncedScenes = 0;

        foreach ($realStoriesCatalog as $storyCode => $catalogInfo) {
            $zipFilename = $storyCode . '.zip';
            $zipPath = $packagesDir . DIRECTORY_SEPARATOR . $zipFilename;

            // Find matching cover
            $matchedCover = null;
            foreach ($actualCovers as $cov) {
                if (Str::startsWith($cov, $catalogInfo['cover_pattern'])) {
                    $matchedCover = $cov;
                    break;
                }
            }

            $sizeBytes = File::exists($zipPath) ? File::size($zipPath) : 0;
            $downloadUrl = File::exists($zipPath) ? ('/storage/packages/' . $zipFilename) : null;

            $story = Story::updateOrCreate(
                ['slug' => $catalogInfo['slug']],
                [
                    'story_code' => $storyCode,
                    'title' => $catalogInfo['title'],
                    'category' => $catalogInfo['category'],
                    'fase' => $catalogInfo['fase'],
                    'description' => $catalogInfo['description'],
                    'cover_image' => $matchedCover ?: ($storyCode . '_cover.jpg'),
                    'thumbnail' => $matchedCover ? ('/storage/covers/' . $matchedCover) : null,
                    'backsound_file' => $catalogInfo['backsound_file'],
                    'download_package_url' => $downloadUrl,
                    'download_size_bytes' => $sizeBytes,
                ]
            );
            $syncedStories++;

            // Now inspect scenes inside the ZIP package
            if (File::exists($zipPath)) {
                $zip = new ZipArchive();
                if ($zip->open($zipPath) === true) {
                    $sceneFiles = [];
                    for ($i = 0; $i < $zip->numFiles; $i++) {
                        $name = $zip->getNameIndex($i);
                        // E.g. story_1_scene_3_video_mute.mp4 or story_1_scene_3_audio.wav
                        if (preg_match('/scene_(\d+)/i', $name, $matches)) {
                            $scNum = (int) $matches[1];
                            if (! isset($sceneFiles[$scNum])) {
                                $sceneFiles[$scNum] = [
                                    'video' => null,
                                    'audio' => null,
                                ];
                            }
                            if (str_ends_with(strtolower($name), '.mp4')) {
                                $sceneFiles[$scNum]['video'] = $name;
                            } elseif (str_ends_with(strtolower($name), '.wav') || str_ends_with(strtolower($name), '.mp3')) {
                                $sceneFiles[$scNum]['audio'] = $name;
                            }
                        }
                    }
                    $zip->close();

                    ksort($sceneFiles);

                    foreach ($sceneFiles as $scNum => $files) {
                        $sceneTitle = "Scene {$scNum}: " . ($scNum === 1 ? 'Pertemuan Awal' : 'Kelanjutan Cerita');

                        // Check if scene exists with custom text
                        $existingScene = Scene::where('story_id', $story->id)
                            ->where('scene_number', $scNum)
                            ->first();

                        $characterName = $existingScene?->character_name ?: ($scNum % 2 === 1 ? 'Narator' : 'Tokoh Cerita');
                        $gorontaloScript = $existingScene?->gorontalo_script ?: "Naskah dialog bahasa Gorontalo Scene {$scNum}.";
                        $indonesianTranslation = $existingScene?->indonesian_translation ?: "Terjemahan bahasa Indonesia untuk Scene {$scNum}.";
                        $dialogues = $existingScene?->dialogues ?: [
                            [
                                'id' => 1,
                                'startTimeMs' => 1000,
                                'endTimeMs' => 4500,
                                'text' => "Dialog Scene {$scNum}",
                                'character' => $characterName,
                            ],
                        ];

                        Scene::updateOrCreate(
                            [
                                'story_id' => $story->id,
                                'scene_number' => $scNum,
                            ],
                            [
                                'title' => $existingScene?->title ?: $sceneTitle,
                                'character_name' => $characterName,
                                'gorontalo_script' => $gorontaloScript,
                                'indonesian_translation' => $indonesianTranslation,
                                'video_asset' => $files['video'] ?: "{$storyCode}_scene_{$scNum}_video_mute.mp4",
                                'video_mute_file' => $files['video'] ?: "{$storyCode}_scene_{$scNum}_video_mute.mp4",
                                'audio_original_file' => $files['audio'] ?: "{$storyCode}_scene_{$scNum}_audio.wav",
                                'dialogues' => $dialogues,
                            ]
                        );
                        $syncedScenes++;
                    }

                    $story->update(['total_scenes' => count($sceneFiles)]);
                }
            }
        }

        return redirect()->route('admin.stories.index')
            ->with('success', "Sinkronisasi berhasil! {$syncedStories} cerita riil dan {$syncedScenes} adegan video/audio fisik telah berhasil dihubungkan ke database.");
    }

    /**
     * Import stories and scenes from uploaded JSON file or pasted JSON text.
     */
    public function importJson(Request $request): RedirectResponse
    {
        $request->validate([
            'json_file' => ['nullable', 'file', 'mimes:json,txt', 'max:51200'], // max 50MB
            'json_text' => ['nullable', 'string'],
        ]);

        $jsonContent = null;

        if ($request->hasFile('json_file')) {
            $jsonContent = File::get($request->file('json_file')->getRealPath());
        } elseif (! empty($request->input('json_text'))) {
            $jsonContent = trim($request->input('json_text'));
        }

        if (empty($jsonContent)) {
            return redirect()->route('admin.stories.index')
                ->with('error', 'Silakan pilih file JSON atau tempel teks JSON terlebih dahulu.');
        }

        $decoded = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded)) {
            return redirect()->route('admin.stories.index')
                ->with('error', 'Format JSON tidak valid: ' . json_last_error_msg());
        }

        // Support both single story object or array of story objects
        $storiesArray = isset($decoded['title']) || isset($decoded['storyId']) || isset($decoded['story_code'])
            ? [$decoded]
            : $decoded;

        $packagesDir = storage_path('app/public/packages');
        $coversDir = storage_path('app/public/covers');

        // Physical covers on disk
        $actualCovers = [];
        if (File::exists($coversDir)) {
            foreach (File::files($coversDir) as $f) {
                $actualCovers[] = $f->getFilename();
            }
        }

        $importedStories = 0;
        $importedScenes = 0;

        foreach ($storiesArray as $item) {
            if (! is_array($item)) {
                continue;
            }

            $title = $item['title'] ?? null;
            if (empty($title)) {
                continue;
            }

            $storyCode = $item['storyId'] ?? $item['story_code'] ?? $item['story_id'] ?? null;
            if (empty($storyCode)) {
                $nextId = (Story::max('id') ?? 0) + 1;
                $storyCode = 'story_' . $nextId;
            }
            $storyCode = Str::slug($storyCode, '_');

            $slug = $item['slug'] ?? Str::slug($title);
            $category = $item['category'] ?? 'Cerita Rakyat Gorontalo';
            $fase = $item['fase'] ?? 'Fase A';
            $description = $item['description'] ?? null;
            $backsound = $item['backsoundFile'] ?? $item['backsound_file'] ?? null;

            // Resolve cover image
            $rawCover = $item['coverImage'] ?? $item['cover_image'] ?? null;
            $coverImage = null;
            if ($rawCover) {
                if (in_array($rawCover, $actualCovers)) {
                    $coverImage = $rawCover;
                } else {
                    foreach ($actualCovers as $cov) {
                        if (Str::startsWith($cov, $rawCover) || Str::startsWith(pathinfo($cov, PATHINFO_FILENAME), $rawCover)) {
                            $coverImage = $cov;
                            break;
                        }
                    }
                    if (! $coverImage) {
                        $coverImage = str_contains($rawCover, '.') ? $rawCover : ($rawCover . '.jpeg');
                    }
                }
            }

            // Resolve ZIP package
            $zipFilename = $storyCode . '.zip';
            $zipPath = $packagesDir . DIRECTORY_SEPARATOR . $zipFilename;
            $zipExists = File::exists($zipPath);

            $downloadUrl = $item['downloadPackageUrl'] ?? $item['download_package_url'] ?? null;
            if (empty($downloadUrl) && $zipExists) {
                $downloadUrl = '/storage/packages/' . $zipFilename;
            }

            $downloadSize = $item['downloadSizeBytes'] ?? $item['download_size_bytes'] ?? null;
            if (empty($downloadSize) && $zipExists) {
                $downloadSize = File::size($zipPath);
            }

            $scenes = $item['scenes'] ?? [];

            $story = Story::updateOrCreate(
                ['slug' => $slug],
                [
                    'story_code' => $storyCode,
                    'title' => $title,
                    'category' => $category,
                    'fase' => $fase,
                    'description' => $description,
                    'cover_image' => $coverImage,
                    'thumbnail' => $coverImage ? ('/storage/covers/' . $coverImage) : null,
                    'backsound_file' => $backsound,
                    'download_package_url' => $downloadUrl,
                    'download_size_bytes' => $downloadSize,
                    'total_scenes' => count($scenes),
                ]
            );
            $importedStories++;

            // Process Scenes
            foreach ($scenes as $sc) {
                if (! is_array($sc)) {
                    continue;
                }

                $scNumber = (int) ($sc['sceneNumber'] ?? $sc['scene_number'] ?? 1);
                $scTitle = $sc['title'] ?? ("Scene {$scNumber}");

                $videoMuteFile = $sc['videoMuteFile'] ?? $sc['video_mute_file'] ?? $sc['videoAsset'] ?? $sc['video_asset'] ?? null;
                if (empty($videoMuteFile)) {
                    $videoMuteFile = "{$storyCode}_scene_{$scNumber}_video_mute.mp4";
                }

                $audioOriginalFile = $sc['audioOriginalFile'] ?? $sc['audio_original_file'] ?? null;
                if (empty($audioOriginalFile)) {
                    $audioOriginalFile = "{$storyCode}_scene_{$scNumber}_audio.wav";
                }

                $dialogues = $sc['dialogues'] ?? [];

                // Extract character & script if not explicitly present at scene root
                $characterName = $sc['characterName'] ?? $sc['character_name'] ?? null;
                $gorontaloScript = $sc['gorontaloScript'] ?? $sc['gorontalo_script'] ?? null;
                $indonesianTranslation = $sc['indonesianTranslation'] ?? $sc['indonesian_translation'] ?? null;

                if (empty($characterName) && ! empty($dialogues) && is_array($dialogues)) {
                    $characterName = $dialogues[0]['character'] ?? 'Narator';
                }

                if (empty($gorontaloScript) && ! empty($dialogues) && is_array($dialogues)) {
                    $dialogueTexts = array_map(function ($d) {
                        return $d['text'] ?? '';
                    }, $dialogues);
                    $gorontaloScript = implode(' ', array_filter($dialogueTexts));
                }

                Scene::updateOrCreate(
                    [
                        'story_id' => $story->id,
                        'scene_number' => $scNumber,
                    ],
                    [
                        'title' => $scTitle,
                        'character_name' => $characterName,
                        'gorontalo_script' => $gorontaloScript,
                        'indonesian_translation' => $indonesianTranslation,
                        'video_asset' => $videoMuteFile,
                        'video_mute_file' => $videoMuteFile,
                        'audio_original_file' => $audioOriginalFile,
                        'dialogues' => $dialogues,
                    ]
                );
                $importedScenes++;
            }

            $story->update(['total_scenes' => $story->scenes()->count()]);
        }

        return redirect()->route('admin.stories.index')
            ->with('success', "Import JSON berhasil! Berhasil memproses {$importedStories} cerita dan {$importedScenes} adegan.");
    }

    /**
     * Helper to format bytes.
     */
    private function formatBytes(int $bytes): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }

        return round($bytes / 1024, 1) . ' KB';
    }
}
