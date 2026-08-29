<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\ApiDocController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DatabaseResetController;
use App\Http\Controllers\Admin\ExportController;
use App\Http\Controllers\Admin\LearnerUserController;
use App\Http\Controllers\Admin\StoryAnalyticsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Models\AppUser;
use App\Models\Story;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Landing Page
Route::get('/', function () {
    return Inertia::render('welcome', [
        'stats' => [
            'total_users' => AppUser::count(),
            'total_plays' => VideoPlayLog::count(),
            'total_voices' => VoiceReplacementLog::sum('replacement_count') ?: VoiceReplacementLog::count(),
            'total_stories' => Story::count(),
        ],
        'featured_stories' => Story::with('scenes')->take(4)->get(),
    ]);
})->name('home');

// Guest Auth Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

// Authenticated Admin Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('index');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Learners Monitoring
        Route::get('/users', [LearnerUserController::class, 'index'])->name('users.index');
        Route::get('/users/{id}', [LearnerUserController::class, 'show'])->name('users.show');
        Route::delete('/users/{id}', [LearnerUserController::class, 'destroy'])->name('users.destroy');

        // Story & Scene Interactivity Matrix (dinonaktifkan sementara)
        // Route::get('/stories', [StoryAnalyticsController::class, 'index'])->name('stories.index');

        // Activity Logs
        Route::get('/logs', [ActivityLogController::class, 'index'])->name('logs.index');

        // CSV Exports
        Route::get('/export/users', [ExportController::class, 'exportUsersCsv'])->name('export.users');
        Route::get('/export/logs', [ExportController::class, 'exportLogsCsv'])->name('export.logs');

        // Database Reset Actions
        Route::post('/system/reset-wipe', [DatabaseResetController::class, 'wipeData'])->name('system.reset.wipe');
        Route::post('/system/reset-seed', [DatabaseResetController::class, 'reseedData'])->name('system.reset.seed');

        // Android API Docs & Testing Sandbox
        Route::get('/api-docs', [ApiDocController::class, 'index'])->name('api-docs.index');
    });
});
