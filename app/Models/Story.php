<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Story extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'description',
        'category',
        'thumbnail',
        'total_scenes',
    ];

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
