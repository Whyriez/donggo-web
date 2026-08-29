<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoPlayLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'app_user_id',
        'device_id',
        'story_id',
        'story_title',
        'scene_id',
        'scene_title',
        'video_name',
        'duration_seconds',
        'is_completed',
        'played_at',
    ];

    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
            'duration_seconds' => 'integer',
            'played_at' => 'datetime',
        ];
    }

    public function appUser(): BelongsTo
    {
        return $this->belongsTo(AppUser::class);
    }

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }

    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }
}
