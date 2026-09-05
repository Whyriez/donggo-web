<?php

use App\Models\AppUser;
use App\Models\Story;
use Database\Seeders\DonggoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DonggoSeeder::class);
    $apiKey = config('services.donggo.api_key') ?: env('DONGGO_API_KEY', 'donggo_secret_api_key_2026');
    $this->withHeader('X-API-KEY', (string) $apiKey);
});

test('monitoring summary api returns statistics', function () {
    $response = $this->getJson('/api/v1/monitoring/summary');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'app_name',
            'version',
            'counts' => [
                'users',
                'video_plays',
                'voice_replacements',
                'stories',
                'scenes',
            ],
            'server_time',
        ]);
});

test('android user registration endpoint works with camelCase fields', function () {
    $payload = [
        'name' => 'Fahri Test User',
        'age' => '10',
        'gender' => 'Laki-laki',
        'educationLevel' => 'SD',
        'educationClass' => 'Kelas 4',
        'gorontaloFrequency' => 'Jarang',
        'appGoal' => 'Belajar kosakata sehari-hari',
        'agePhase' => 'Anak-anak (7-12 tahun)',
        'deviceId' => 'test-device-unique-1234',
    ];

    $response = $this->postJson('/api/v1/monitoring/user', $payload);

    $response->assertStatus(201)
        ->assertJson([
            'status' => 'success',
            'data' => [
                'name' => 'Fahri Test User',
                'device_id' => 'test-device-unique-1234',
            ],
        ]);

    $this->assertDatabaseHas('app_users', [
        'name' => 'Fahri Test User',
        'education_level' => 'SD',
        'education_class' => 'Kelas 4',
        'device_id' => 'test-device-unique-1234',
    ]);
});

test('log video play endpoint works', function () {
    $user = AppUser::first();

    $response = $this->postJson('/api/v1/monitoring/video-play', [
        'user_id' => $user->id,
        'story_title' => 'Legenda Lahilote (Batu Pohe)',
        'scene_title' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
        'video_name' => 'lahilote_scene_1.mp4',
        'duration_seconds' => 45,
        'is_completed' => true,
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'status' => 'success',
            'data' => [
                'story_title' => 'Legenda Lahilote (Batu Pohe)',
                'scene_title' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
            ],
        ]);
});

test('log voice replacement endpoint works', function () {
    $user = AppUser::first();

    $response = $this->postJson('/api/v1/monitoring/voice-replace', [
        'user_id' => $user->id,
        'story_title' => 'Legenda Lahilote (Batu Pohe)',
        'scene_title' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
        'action_type' => 'replaced',
        'replacement_count' => 1,
        'audio_duration_seconds' => 12.5,
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'status' => 'success',
            'data' => [
                'story_title' => 'Legenda Lahilote (Batu Pohe)',
                'scene_title' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
                'replacement_count' => 1,
            ],
        ]);
});

test('sync batch endpoint works for offline synchronization', function () {
    $response = $this->postJson('/api/v1/monitoring/sync-batch', [
        'user' => [
            'name' => 'Batch Learner',
            'deviceId' => 'batch-device-555',
            'educationLevel' => 'SMP',
            'educationClass' => 'Kelas 7',
            'gorontaloFrequency' => 'Kadang-kadang',
            'appGoal' => 'Melatih intonasi bahasa Gorontalo',
            'agePhase' => 'Remaja (13-17 tahun)',
        ],
        'video_plays' => [
            [
                'story_title' => 'Putri Botutihe & Keindahan Kain Karawo',
                'scene_title' => 'Scene 1: Menarik Benang & Menyulam Motif Karawo',
                'duration_seconds' => 50,
                'is_completed' => true,
            ],
        ],
        'voice_replacements' => [
            [
                'story_title' => 'Putri Botutihe & Keindahan Kain Karawo',
                'scene_title' => 'Scene 1: Menarik Benang & Menyulam Motif Karawo',
                'action_type' => 'replaced',
                'replacement_count' => 2,
                'audio_duration_seconds' => 14.2,
            ],
        ],
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'success',
            'data' => [
                'synced_video_plays' => 1,
                'synced_voice_replacements' => 1,
            ],
        ]);
});

test('stories catalog endpoint returns stories and scenes', function () {
    $response = $this->getJson('/api/v1/monitoring/stories');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'slug',
                    'scenes',
                ],
            ],
        ]);
});

test('stories catalog endpoint returns download package info and dialogues', function () {
    $response = $this->getJson('/api/v1/stories');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'data' => [
                '*' => [
                    'id',
                    'storyId',
                    'title',
                    'fase',
                    'downloadPackageUrl',
                    'downloadSizeBytes',
                    'downloadSizeFormatted',
                    'scenes' => [
                        '*' => [
                            'sceneNumber',
                            'videoMuteFile',
                            'audioOriginalFile',
                            'dialogues',
                        ],
                    ],
                ],
            ],
        ]);
});
