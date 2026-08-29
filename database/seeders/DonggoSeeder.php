<?php

namespace Database\Seeders;

use App\Models\AppUser;
use App\Models\Scene;
use App\Models\Story;
use App\Models\User;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DonggoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Admin User
        User::updateOrCreate(
            ['email' => 'admin@donggo.id'],
            [
                'name' => 'Admin Donggo',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Stories & Scenes
        $storiesData = [
            [
                'slug' => 'legenda-lahilote',
                'title' => 'Legenda Lahilote (Batu Pohe)',
                'description' => 'Kisah heroik Lahilote yang bertemu dengan bidadari kahyangan di perbukitan Gorontalo dan jejak tapak kakinya yang melegenda di pesisir Pohe.',
                'category' => 'Cerita Rakyat Gorontalo',
                'thumbnail' => '/images/lahilote.jpg',
                'scenes' => [
                    [
                        'scene_number' => 1,
                        'title' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
                        'video_asset' => 'lahilote_scene_1.mp4',
                        'character_name' => 'Lahilote',
                        'gorontalo_script' => 'Oliyo ta mohelato, wau yilowali mota to hungayo.',
                        'indonesian_translation' => 'Dia sangat rupawan dan anggun, aku terpesona di tepi sungai.',
                    ],
                    [
                        'scene_number' => 2,
                        'title' => 'Scene 2: Selendang Yang Disembunyikan',
                        'video_asset' => 'lahilote_scene_2.mp4',
                        'character_name' => 'Putri Bidadari',
                        'gorontalo_script' => 'Tolianggu ma ilowali, wau dila mowali tumomboto ode kayangan.',
                        'indonesian_translation' => 'Selendangku telah hilang, aku tidak bisa lagi terbang kembali ke kayangan.',
                    ],
                    [
                        'scene_number' => 3,
                        'title' => 'Scene 3: Janji Abadi & Jejak Tapak Raksasa di Pohe',
                        'video_asset' => 'lahilote_scene_3.mp4',
                        'character_name' => 'Lahilote',
                        'gorontalo_script' => 'Hilawo woluo to olio, wau ma modudu\'o wolo hulawa to Pohe.',
                        'indonesian_translation' => 'Hatiku bersamanya, aku bersumpah meninggalkan jejak abadi di tanah Pohe.',
                    ],
                ],
            ],
            [
                'slug' => 'asal-usul-danau-limboto',
                'title' => 'Asal Usul Danau Limboto (Bulalo Limboto)',
                'description' => 'Dongeng terciptanya Danau Limboto dari mata air abadi yang membawa berkah kesuburan bagi rakyat Hulontalo.',
                'category' => 'Legenda Alam',
                'thumbnail' => '/images/limboto.jpg',
                'scenes' => [
                    [
                        'scene_number' => 1,
                        'title' => 'Scene 1: Mata Air Suci di Lembah Hijau',
                        'video_asset' => 'limboto_scene_1.mp4',
                        'character_name' => 'Tetua Adat',
                        'gorontalo_script' => 'Taluhu botiye londo Hulontalo, momongu batanga wawu lipu.',
                        'indonesian_translation' => 'Air suci ini berasal dari tanah Gorontalo, menghidupi raga dan menyuburkan negeri.',
                    ],
                    [
                        'scene_number' => 2,
                        'title' => 'Scene 2: Terbentuknya Danau Kebanggaan Negeri',
                        'video_asset' => 'limboto_scene_2.mp4',
                        'character_name' => 'Nelayan Muda',
                        'gorontalo_script' => 'Bulalo Limboto ma yilowali, tambati lo pongolapa wawu hidayah.',
                        'indonesian_translation' => 'Danau Limboto telah terhampar luas, tempat kita mencari rezeki penuh berkah.',
                    ],
                ],
            ],
            [
                'slug' => 'olangia-pohalaa',
                'title' => 'Olangia & Musyawarah Pohala\'a',
                'description' => 'Kisah persatuan lima kerajaan bersaudara (Limo Lo Pohala\'a) dalam menyelesaikan perbedaan dengan musyawarah Dulohupa.',
                'category' => 'Sejarah & Nilai Luhur',
                'thumbnail' => '/images/olangia.jpg',
                'scenes' => [
                    [
                        'scene_number' => 1,
                        'title' => 'Scene 1: Musyawarah Dulohupa di Bantayo Poboide',
                        'video_asset' => 'olangia_scene_1.mp4',
                        'character_name' => 'Raja Olangia',
                        'gorontalo_script' => 'Dulohupa lo lipu, mopiyohu tuwawu to hilawo da\'a.',
                        'indonesian_translation' => 'Musyawarah negeri, menyatukan niat baik dalam satu kebulatan tekad mufakat.',
                    ],
                    [
                        'scene_number' => 2,
                        'title' => 'Scene 2: Sumpah Persaudaraan Limo Lo Pohala\'a',
                        'video_asset' => 'olangia_scene_2.mp4',
                        'character_name' => 'Ksatria Hulontalo',
                        'gorontalo_script' => 'Wau mopatodu sumpa, modaha lipu londo bala wawu panyake.',
                        'indonesian_translation' => 'Kuteguhkan sumpah setia, menjaga tanah air Gorontalo dari perselisihan.',
                    ],
                ],
            ],
            [
                'slug' => 'putri-botutihe-karawo',
                'title' => 'Putri Botutihe & Keindahan Kain Karawo',
                'description' => 'Animasi edukasi tentang kesabaran, ketelitian, dan cinta dalam menyulam kain tradisional khas Gorontalo, Karawo.',
                'category' => 'Seni Budaya Tradisional',
                'thumbnail' => '/images/karawo.jpg',
                'scenes' => [
                    [
                        'scene_number' => 1,
                        'title' => 'Scene 1: Menarik Benang & Menyulam Motif Karawo',
                        'video_asset' => 'karawo_scene_1.mp4',
                        'character_name' => 'Putri Botutihe',
                        'gorontalo_script' => 'Karawo botiye mopiyohu, heluma lo toliangu wawu sabari.',
                        'indonesian_translation' => 'Sulaman Karawo ini sangat molek, buah dari cinta, ketekunan, dan kesabaran.',
                    ],
                    [
                        'scene_number' => 2,
                        'title' => 'Scene 2: Warisan Mahakarya Anak Negeri',
                        'video_asset' => 'karawo_scene_2.mp4',
                        'character_name' => 'Ibu Pengrajin',
                        'gorontalo_script' => 'Pobelajariyo wopato, alihu dila ma lipata to timi\'idu wakutu.',
                        'indonesian_translation' => 'Pelajarilah dengan sungguh-sungguh, agar warisan agung ini lestari selamanya.',
                    ],
                ],
            ],
        ];

        $createdStories = [];
        $createdScenes = [];

        foreach ($storiesData as $sData) {
            $scenes = $sData['scenes'];
            unset($sData['scenes']);
            $sData['total_scenes'] = count($scenes);

            $story = Story::updateOrCreate(['slug' => $sData['slug']], $sData);
            $createdStories[$story->title] = $story;

            foreach ($scenes as $sc) {
                $sc['story_id'] = $story->id;
                $scene = Scene::updateOrCreate(
                    ['story_id' => $story->id, 'scene_number' => $sc['scene_number']],
                    $sc
                );
                $createdScenes[$story->title][$scene->title] = $scene;
            }
        }

        // 3. Learner Users (UserMonitoringData from Android app)
        $usersData = [
            [
                'device_id' => 'donggo-dev-9021',
                'name' => 'Fahri Pratama',
                'age' => '10',
                'gender' => 'Laki-laki',
                'education_level' => 'SD',
                'education_class' => 'Kelas 4',
                'gorontalo_frequency' => 'Jarang',
                'app_goal' => 'Belajar kosakata cerita rakyat Gorontalo',
                'age_phase' => 'Anak-anak (7-12 tahun)',
            ],
            [
                'device_id' => 'donggo-dev-8812',
                'name' => 'Aisyah Putri Hulontalo',
                'age' => '11',
                'gender' => 'Perempuan',
                'education_level' => 'SD',
                'education_class' => 'Kelas 5',
                'gorontalo_frequency' => 'Kadang-kadang',
                'app_goal' => 'Ingin bisa dubbing suara karakter kartun Gorontalo',
                'age_phase' => 'Anak-anak (7-12 tahun)',
            ],
            [
                'device_id' => 'donggo-dev-3419',
                'name' => 'Mohamad Rayyan',
                'age' => '8',
                'gender' => 'Laki-laki',
                'education_level' => 'SD',
                'education_class' => 'Kelas 2',
                'gorontalo_frequency' => 'Tidak Pernah',
                'app_goal' => 'Mengisi suara animasi & belajar bahasa daerah',
                'age_phase' => 'Anak-anak (7-12 tahun)',
            ],
            [
                'device_id' => 'donggo-dev-7742',
                'name' => 'Nabila Zahra Botutihe',
                'age' => '14',
                'gender' => 'Perempuan',
                'education_level' => 'SMP',
                'education_class' => 'Kelas 8',
                'gorontalo_frequency' => 'Sering',
                'app_goal' => 'Memahami dialek asli dan cerita daerah Gorontalo',
                'age_phase' => 'Remaja (13-17 tahun)',
            ],
            [
                'device_id' => 'donggo-dev-1156',
                'name' => 'Dimas Prasetyo',
                'age' => '9',
                'gender' => 'Laki-laki',
                'education_level' => 'SD',
                'education_class' => 'Kelas 3',
                'gorontalo_frequency' => 'Jarang',
                'app_goal' => 'Latihan berbicara bahasa Gorontalo lewat video interaktif',
                'age_phase' => 'Anak-anak (7-12 tahun)',
            ],
            [
                'device_id' => 'donggo-dev-5520',
                'name' => 'Siti Nurhaliza',
                'age' => '12',
                'gender' => 'Perempuan',
                'education_level' => 'SD',
                'education_class' => 'Kelas 6',
                'gorontalo_frequency' => 'Kadang-kadang',
                'app_goal' => 'Tugas sekolah bahasa daerah dan game interaktif',
                'age_phase' => 'Anak-anak (7-12 tahun)',
            ],
            [
                'device_id' => 'donggo-dev-6631',
                'name' => 'Rizky Alamsyah',
                'age' => '15',
                'gender' => 'Laki-laki',
                'education_level' => 'SMP',
                'education_class' => 'Kelas 9',
                'gorontalo_frequency' => 'Sering',
                'app_goal' => 'Melestarikan budaya Gorontalo & proyek dubbing suara',
                'age_phase' => 'Remaja (13-17 tahun)',
            ],
        ];

        $appUsers = [];
        foreach ($usersData as $u) {
            $user = AppUser::updateOrCreate(['device_id' => $u['device_id']], $u);
            $appUsers[] = $user;
        }

        // 4. Populate Activity Logs (Video Plays & Voice Dubbing)
        // Let's create realistic activity over the past 5 days
        $activitiesPlan = [
            // Fahri: Likes Lahilote scene 1 & 2
            [
                'user' => $appUsers[0],
                'plays' => [
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai', 'count' => 6, 'dur' => 45],
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 2: Selendang Yang Disembunyikan', 'count' => 4, 'dur' => 50],
                    ['story' => 'Asal Usul Danau Limboto (Bulalo Limboto)', 'scene' => 'Scene 1: Mata Air Suci di Lembah Hijau', 'count' => 3, 'dur' => 40],
                ],
                'voices' => [
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai', 'count' => 4, 'dur' => 12.4],
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 2: Selendang Yang Disembunyikan', 'count' => 3, 'dur' => 15.1],
                ],
            ],
            // Aisyah: Likes Putri Botutihe Karawo & Lahilote
            [
                'user' => $appUsers[1],
                'plays' => [
                    ['story' => 'Putri Botutihe & Keindahan Kain Karawo', 'scene' => 'Scene 1: Menarik Benang & Menyulam Motif Karawo', 'count' => 8, 'dur' => 60],
                    ['story' => 'Putri Botutihe & Keindahan Kain Karawo', 'scene' => 'Scene 2: Warisan Mahakarya Anak Negeri', 'count' => 5, 'dur' => 55],
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 2: Selendang Yang Disembunyikan', 'count' => 4, 'dur' => 48],
                ],
                'voices' => [
                    ['story' => 'Putri Botutihe & Keindahan Kain Karawo', 'scene' => 'Scene 1: Menarik Benang & Menyulam Motif Karawo', 'count' => 6, 'dur' => 14.8],
                    ['story' => 'Putri Botutihe & Keindahan Kain Karawo', 'scene' => 'Scene 2: Warisan Mahakarya Anak Negeri', 'count' => 4, 'dur' => 16.2],
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 2: Selendang Yang Disembunyikan', 'count' => 5, 'dur' => 13.5],
                ],
            ],
            // Rayyan: New learner, plays Limboto & Olangia
            [
                'user' => $appUsers[2],
                'plays' => [
                    ['story' => 'Asal Usul Danau Limboto (Bulalo Limboto)', 'scene' => 'Scene 1: Mata Air Suci di Lembah Hijau', 'count' => 5, 'dur' => 38],
                    ['story' => 'Asal Usul Danau Limboto (Bulalo Limboto)', 'scene' => 'Scene 2: Terbentuknya Danau Kebanggaan Negeri', 'count' => 3, 'dur' => 42],
                    ['story' => 'Olangia & Musyawarah Pohala\'a', 'scene' => 'Scene 1: Musyawarah Dulohupa di Bantayo Poboide', 'count' => 2, 'dur' => 45],
                ],
                'voices' => [
                    ['story' => 'Asal Usul Danau Limboto (Bulalo Limboto)', 'scene' => 'Scene 1: Mata Air Suci di Lembah Hijau', 'count' => 2, 'dur' => 10.5],
                    ['story' => 'Asal Usul Danau Limboto (Bulalo Limboto)', 'scene' => 'Scene 2: Terbentuknya Danau Kebanggaan Negeri', 'count' => 1, 'dur' => 11.2],
                ],
            ],
            // Nabila: High engagement with Olangia & Lahilote
            [
                'user' => $appUsers[3],
                'plays' => [
                    ['story' => 'Olangia & Musyawarah Pohala\'a', 'scene' => 'Scene 1: Musyawarah Dulohupa di Bantayo Poboide', 'count' => 7, 'dur' => 62],
                    ['story' => 'Olangia & Musyawarah Pohala\'a', 'scene' => 'Scene 2: Sumpah Persaudaraan Limo Lo Pohala\'a', 'count' => 6, 'dur' => 58],
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 3: Janji Abadi & Jejak Tapak Raksasa di Pohe', 'count' => 5, 'dur' => 50],
                ],
                'voices' => [
                    ['story' => 'Olangia & Musyawarah Pohala\'a', 'scene' => 'Scene 1: Musyawarah Dulohupa di Bantayo Poboide', 'count' => 5, 'dur' => 18.0],
                    ['story' => 'Olangia & Musyawarah Pohala\'a', 'scene' => 'Scene 2: Sumpah Persaudaraan Limo Lo Pohala\'a', 'count' => 4, 'dur' => 17.5],
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 3: Janji Abadi & Jejak Tapak Raksasa di Pohe', 'count' => 3, 'dur' => 14.0],
                ],
            ],
            // Dimas: Plays Lahilote
            [
                'user' => $appUsers[4],
                'plays' => [
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai', 'count' => 4, 'dur' => 40],
                    ['story' => 'Asal Usul Danau Limboto (Bulalo Limboto)', 'scene' => 'Scene 1: Mata Air Suci di Lembah Hijau', 'count' => 3, 'dur' => 35],
                ],
                'voices' => [
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai', 'count' => 3, 'dur' => 9.8],
                ],
            ],
            // Siti: Plays Karawo
            [
                'user' => $appUsers[5],
                'plays' => [
                    ['story' => 'Putri Botutihe & Keindahan Kain Karawo', 'scene' => 'Scene 1: Menarik Benang & Menyulam Motif Karawo', 'count' => 6, 'dur' => 55],
                ],
                'voices' => [
                    ['story' => 'Putri Botutihe & Keindahan Kain Karawo', 'scene' => 'Scene 1: Menarik Benang & Menyulam Motif Karawo', 'count' => 4, 'dur' => 13.2],
                ],
            ],
            // Rizky: Plays all stories
            [
                'user' => $appUsers[6],
                'plays' => [
                    ['story' => 'Olangia & Musyawarah Pohala\'a', 'scene' => 'Scene 1: Musyawarah Dulohupa di Bantayo Poboide', 'count' => 5, 'dur' => 60],
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai', 'count' => 4, 'dur' => 45],
                ],
                'voices' => [
                    ['story' => 'Olangia & Musyawarah Pohala\'a', 'scene' => 'Scene 1: Musyawarah Dulohupa di Bantayo Poboide', 'count' => 3, 'dur' => 16.0],
                    ['story' => 'Legenda Lahilote (Batu Pohe)', 'scene' => 'Scene 1: Pertemuan di Mata Air Hulu Sungai', 'count' => 2, 'dur' => 11.5],
                ],
            ],
        ];

        foreach ($activitiesPlan as $item) {
            $user = $item['user'];

            // Seed Plays
            foreach ($item['plays'] as $playData) {
                $storyModel = $createdStories[$playData['story']] ?? null;
                $sceneModel = $createdScenes[$playData['story']][$playData['scene']] ?? null;

                for ($i = 0; $i < $playData['count']; $i++) {
                    $randomHoursAgo = rand(1, 120);
                    $playedAt = Carbon::now()->subHours($randomHoursAgo)->subMinutes(rand(1, 59));

                    VideoPlayLog::create([
                        'app_user_id' => $user->id,
                        'device_id' => $user->device_id,
                        'story_id' => $storyModel?->id,
                        'story_title' => $playData['story'],
                        'scene_id' => $sceneModel?->id,
                        'scene_title' => $playData['scene'],
                        'video_name' => $sceneModel?->video_asset ?: 'animation_video.mp4',
                        'duration_seconds' => $playData['dur'] + rand(-5, 10),
                        'is_completed' => rand(0, 10) > 2,
                        'played_at' => $playedAt,
                    ]);
                }
            }

            // Seed Voice Replacements
            foreach ($item['voices'] as $voiceData) {
                $storyModel = $createdStories[$voiceData['story']] ?? null;
                $sceneModel = $createdScenes[$voiceData['story']][$voiceData['scene']] ?? null;

                for ($i = 0; $i < $voiceData['count']; $i++) {
                    $randomHoursAgo = rand(1, 120);
                    $recordedAt = Carbon::now()->subHours($randomHoursAgo)->subMinutes(rand(1, 59));

                    VoiceReplacementLog::create([
                        'app_user_id' => $user->id,
                        'device_id' => $user->device_id,
                        'story_id' => $storyModel?->id,
                        'story_title' => $voiceData['story'],
                        'scene_id' => $sceneModel?->id,
                        'scene_title' => $voiceData['scene'],
                        'action_type' => 'replaced',
                        'replacement_count' => 1,
                        'audio_duration_seconds' => $voiceData['dur'] + (rand(-20, 20) / 10),
                        'recorded_at' => $recordedAt,
                    ]);
                }
            }
        }
    }
}
