<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. App / Learner Users (from Android App UserMonitoringData)
        Schema::create('app_users', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->nullable()->index();
            $table->string('name');
            $table->string('age')->nullable();
            $table->string('gender')->nullable();
            $table->string('education_level')->nullable();
            $table->string('education_class')->nullable();
            $table->string('gorontalo_frequency')->nullable();
            $table->string('app_goal')->nullable();
            $table->string('age_phase')->nullable();
            $table->json('extra_metadata')->nullable();
            $table->timestamps();
        });

        // 2. Stories (Donggo Animation Stories)
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('Cerita Rakyat Gorontalo');
            $table->string('thumbnail')->nullable();
            $table->integer('total_scenes')->default(1);
            $table->timestamps();
        });

        // 3. Scenes (Story Scenes for video & voice dubbing)
        Schema::create('scenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('stories')->cascadeOnDelete();
            $table->integer('scene_number')->default(1);
            $table->string('title');
            $table->string('video_asset')->nullable();
            $table->string('character_name')->nullable();
            $table->text('gorontalo_script')->nullable();
            $table->text('indonesian_translation')->nullable();
            $table->timestamps();
        });

        // 4. Video Play Logs (play counts, video tracking per story & scene)
        Schema::create('video_play_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('app_user_id')->nullable()->constrained('app_users')->nullOnDelete();
            $table->string('device_id')->nullable()->index();
            $table->foreignId('story_id')->nullable()->constrained('stories')->nullOnDelete();
            $table->string('story_title');
            $table->foreignId('scene_id')->nullable()->constrained('scenes')->nullOnDelete();
            $table->string('scene_title');
            $table->string('video_name')->nullable();
            $table->integer('duration_seconds')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('played_at')->useCurrent();
            $table->timestamps();
        });

        // 5. Voice Replacement Logs (interactivity, voice replacement per story & scene)
        Schema::create('voice_replacement_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('app_user_id')->nullable()->constrained('app_users')->nullOnDelete();
            $table->string('device_id')->nullable()->index();
            $table->foreignId('story_id')->nullable()->constrained('stories')->nullOnDelete();
            $table->string('story_title');
            $table->foreignId('scene_id')->nullable()->constrained('scenes')->nullOnDelete();
            $table->string('scene_title');
            $table->string('action_type')->default('replaced'); // 'recorded', 'replaced', 'previewed', 'reset'
            $table->integer('replacement_count')->default(1);
            $table->float('audio_duration_seconds')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voice_replacement_logs');
        Schema::dropIfExists('video_play_logs');
        Schema::dropIfExists('scenes');
        Schema::dropIfExists('stories');
        Schema::dropIfExists('app_users');
    }
};
