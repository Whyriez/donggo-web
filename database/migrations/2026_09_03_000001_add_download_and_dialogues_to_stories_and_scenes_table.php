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
            if (! Schema::hasColumn('stories', 'story_code')) {
                $table->string('story_code')->nullable()->after('id')->index();
            }
            if (! Schema::hasColumn('stories', 'fase')) {
                $table->string('fase')->nullable()->after('category');
            }
            if (! Schema::hasColumn('stories', 'backsound_file')) {
                $table->string('backsound_file')->nullable()->after('thumbnail');
            }
            if (! Schema::hasColumn('stories', 'cover_image')) {
                $table->string('cover_image')->nullable()->after('thumbnail');
            }
            if (! Schema::hasColumn('stories', 'download_package_url')) {
                $table->string('download_package_url')->nullable()->after('backsound_file');
            }
            if (! Schema::hasColumn('stories', 'download_size_bytes')) {
                $table->unsignedBigInteger('download_size_bytes')->nullable()->after('download_package_url');
            }
        });

        Schema::table('scenes', function (Blueprint $table) {
            if (! Schema::hasColumn('scenes', 'video_mute_file')) {
                $table->string('video_mute_file')->nullable()->after('video_asset');
            }
            if (! Schema::hasColumn('scenes', 'audio_original_file')) {
                $table->string('audio_original_file')->nullable()->after('video_mute_file');
            }
            if (! Schema::hasColumn('scenes', 'dialogues')) {
                $table->json('dialogues')->nullable()->after('indonesian_translation');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $cols = array_filter(['video_mute_file', 'audio_original_file', 'dialogues'], function ($col) {
                return Schema::hasColumn('scenes', $col);
            });
            if (! empty($cols)) {
                $table->dropColumn(array_values($cols));
            }
        });

        Schema::table('stories', function (Blueprint $table) {
            $cols = array_filter([
                'story_code',
                'fase',
                'backsound_file',
                'cover_image',
                'download_package_url',
                'download_size_bytes',
            ], function ($col) {
                return Schema::hasColumn('stories', $col);
            });
            if (! empty($cols)) {
                $table->dropColumn(array_values($cols));
            }
        });
    }
};
