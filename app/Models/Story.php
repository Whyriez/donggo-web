<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Story extends Model
{
    use HasFactory;

    protected $fillable = [
        'story_code',
        'slug',
        'title',
        'description',
        'category',
        'fase',
        'thumbnail',
        'cover_image',
        'backsound_file',
        'download_package_url',
        'download_size_bytes',
        'total_scenes',
    ];

    /**
     * Get human-readable formatted download size.
     */
    public function getDownloadSizeFormattedAttribute(): ?string
    {
        $bytes = $this->download_size_bytes;
        if (! $bytes) {
            return null;
        }

        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1) . ' MB';
        }

        return round($bytes / 1024, 1) . ' KB';
    }

    public function scenes(): HasMany
    {
        return $this->hasMany(Scene::class)->orderBy('scene_number');
    }

    public function videoPlayLogs(): HasMany
    {
        return $this->hasMany(VideoPlayLog::class);
    }

    public function voiceReplacementLogs(): HasMany
    {
        return $this->hasMany(VoiceReplacementLog::class);
    }
}
