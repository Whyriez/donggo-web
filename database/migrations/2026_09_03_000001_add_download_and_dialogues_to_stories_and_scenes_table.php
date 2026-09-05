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
        Schema::table('stories', function (Blueprint $table) {
            $table->string('story_code')->nullable()->after('id')->index();
            $table->string('fase')->nullable()->after('category');
            $table->string('backsound_file')->nullable()->after('thumbnail');
            $table->string('cover_image')->nullable()->after('thumbnail');
            $table->string('download_package_url')->nullable()->after('backsound_file');
            $table->unsignedBigInteger('download_size_bytes')->nullable()->after('download_package_url');
        });

        Schema::table('scenes', function (Blueprint $table) {
            $table->string('video_mute_file')->nullable()->after('video_asset');
            $table->string('audio_original_file')->nullable()->after('video_mute_file');
            $table->json('dialogues')->nullable()->after('indonesian_translation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->dropColumn([
                'video_mute_file',
                'audio_original_file',
                'dialogues',
            ]);
        });

        Schema::table('stories', function (Blueprint $table) {
            $table->dropColumn([
                'story_code',
                'fase',
                'backsound_file',
                'cover_image',
                'download_package_url',
                'download_size_bytes',
            ]);
        });
    }
};
