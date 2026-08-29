<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AppUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'name',
        'age',
        'gender',
        'education_level',
        'education_class',
        'gorontalo_frequency',
        'app_goal',
        'age_phase',
        'extra_metadata',
    ];

    protected function casts(): array
    {
        return [
            'extra_metadata' => 'array',
        ];
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
