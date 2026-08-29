<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scene extends Model
{
    use HasFactory;

    protected $fillable = [
        'story_id',
        'scene_number',
        'title',
        'video_asset',
        'character_name',
        'gorontalo_script',
        'indonesian_translation',
    ];

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
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
