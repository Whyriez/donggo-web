<?php

use App\Http\Controllers\Api\MonitoringApiController;
use App\Http\Middleware\ValidateApiKey;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Donggo Android API Routes (v1)
|--------------------------------------------------------------------------
|
| Endpoints used by the Donggo Android App to send UserMonitoringData,
| video play events, voice replacement logs, and batch sync.
| Protected with X-API-KEY middleware.
|
*/

Route::prefix('v1')->middleware(ValidateApiKey::class)->group(function () {
    // Stories & Scenes Catalog for Android App (both /api/v1/stories and /api/v1/monitoring/stories)
    Route::get('/stories', [MonitoringApiController::class, 'getStories'])->name('api.v1.stories');
    Route::get('/summary', [MonitoringApiController::class, 'getSummary'])->name('api.v1.summary');

    // Monitoring Endpoints (with /monitoring prefix)
    Route::prefix('monitoring')->group(function () {
        Route::get('/summary', [MonitoringApiController::class, 'getSummary'])->name('api.monitoring.summary');
        Route::post('/user', [MonitoringApiController::class, 'registerUser'])->name('api.monitoring.user');
        Route::post('/video-play', [MonitoringApiController::class, 'logVideoPlay'])->name('api.monitoring.video-play');
        Route::post('/voice-replace', [MonitoringApiController::class, 'logVoiceReplacement'])->name('api.monitoring.voice-replace');
        Route::post('/sync-batch', [MonitoringApiController::class, 'syncBatch'])->name('api.monitoring.sync-batch');
        Route::get('/stories', [MonitoringApiController::class, 'getStories'])->name('api.monitoring.stories');
    });

    // Direct aliases under /api/v1/*
    Route::post('/user', [MonitoringApiController::class, 'registerUser'])->name('api.v1.user');
    Route::post('/video-play', [MonitoringApiController::class, 'logVideoPlay'])->name('api.v1.video-play');
    Route::post('/voice-replace', [MonitoringApiController::class, 'logVoiceReplacement'])->name('api.v1.voice-replace');
    Route::post('/sync-batch', [MonitoringApiController::class, 'syncBatch'])->name('api.v1.sync-batch');
});
