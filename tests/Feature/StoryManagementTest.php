<?php

use App\Models\Scene;
use App\Models\Story;
use App\Models\User;
use Database\Seeders\DonggoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DonggoSeeder::class);
});

test('guest is redirected from admin stories page to login', function () {
    $response = $this->get(route('admin.stories.index'));
    $response->assertRedirect(route('login'));
});

test('admin can access stories index page', function () {
    $admin = User::first();

    $response = $this->actingAs($admin)->get(route('admin.stories.index'));
    $response->assertOk();
});

test('admin can create a story', function () {
    $admin = User::first();

    $response = $this->actingAs($admin)->post(route('admin.stories.store'), [
        'title' => 'Cerita Uji Coba Pest',
        'story_code' => 'story_test_99',
        'category' => 'Cerita Rakyat Gorontalo',
        'fase' => 'Fase A',
        'description' => 'Deskripsi naskah pengujian',
    ]);

    $response->assertRedirect(route('admin.stories.index'));
    $this->assertDatabaseHas('stories', [
        'story_code' => 'story_test_99',
        'title' => 'Cerita Uji Coba Pest',
    ]);
});

test('admin can add a scene to a story', function () {
    $admin = User::first();
    $story = Story::first();

    $response = $this->actingAs($admin)->post(route('admin.stories.scenes.store', ['story' => $story->id]), [
        'scene_number' => 99,
        'title' => 'Scene 99: Pengujian Adegan',
        'character_name' => 'Narator Pest',
        'gorontalo_script' => 'Dialog uji coba bahasa Gorontalo',
        'indonesian_translation' => 'Terjemahan uji coba',
        'video_mute_file' => 'test_video_mute.mp4',
        'audio_original_file' => 'test_audio.wav',
    ]);

    $response->assertRedirect(route('admin.stories.index'));
    $this->assertDatabaseHas('scenes', [
        'story_id' => $story->id,
        'scene_number' => 99,
        'title' => 'Scene 99: Pengujian Adegan',
    ]);
});

test('admin can trigger storage assets synchronization', function () {
    $admin = User::first();

    $response = $this->actingAs($admin)->post(route('admin.stories.sync-storage'));
    $response->assertRedirect(route('admin.stories.index'));
    $response->assertSessionHas('success');
});

test('admin can import stories and scenes from json text', function () {
    $admin = User::first();

    $jsonPayload = json_encode([
        [
            'storyId' => 'story_import_test',
            'title' => 'Cerita Import Dari Pipeline',
            'fase' => 'Fase A',
            'coverImage' => 'cover_hemolapula_lo_putito',
            'scenes' => [
                [
                    'sceneNumber' => 1,
                    'videoMuteFile' => 'story_import_1_mute.mp4',
                    'audioOriginalFile' => 'story_import_1_audio.wav',
                    'dialogues' => [
                        [
                            'id' => 1,
                            'startTimeMs' => 1500,
                            'endTimeMs' => 3000,
                            'text' => 'Boli bolo te Deka',
                            'character' => 'Narator'
                        ]
                    ]
                ],
                [
                    'sceneNumber' => 2,
                    'videoMuteFile' => 'story_import_2_mute.mp4',
                    'audioOriginalFile' => 'story_import_2_audio.wav',
                    'dialogues' => [
                        [
                            'id' => 1,
                            'startTimeMs' => 3200,
                            'endTimeMs' => 5000,
                            'text' => 'Wah Putito!',
                            'character' => 'Deka'
                        ]
                    ]
                ]
            ]
        ]
    ]);

    $response = $this->actingAs($admin)->post(route('admin.stories.import-json'), [
        'json_text' => $jsonPayload,
    ]);

    $response->assertRedirect(route('admin.stories.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('stories', [
        'story_code' => 'story_import_test',
        'title' => 'Cerita Import Dari Pipeline',
        'fase' => 'Fase A',
    ]);

    $story = Story::where('story_code', 'story_import_test')->first();
    expect($story)->not->toBeNull();
    expect($story->scenes)->toHaveCount(2);

    $this->assertDatabaseHas('scenes', [
        'story_id' => $story->id,
        'scene_number' => 1,
        'character_name' => 'Narator',
        'gorontalo_script' => 'Boli bolo te Deka',
    ]);
});

test('admin cannot import invalid json content', function () {
    $admin = User::first();

    $response = $this->actingAs($admin)->post(route('admin.stories.import-json'), [
        'json_text' => 'THIS IS NOT VALID JSON {{{',
    ]);

    $response->assertRedirect(route('admin.stories.index'));
    $response->assertSessionHas('error');
});

