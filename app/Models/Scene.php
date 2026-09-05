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
        'video_mute_file',
        'audio_original_file',
        'character_name',
        'gorontalo_script',
        'indonesian_translation',
        'dialogues',
    ];

    protected $casts = [
        'scene_number' => 'integer',
        'dialogues' => 'array',
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
