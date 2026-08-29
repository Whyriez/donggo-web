<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\Story;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiDocController extends Controller
{
    /**
     * Display interactive API documentation and testing sandbox for Android.
     */
    public function index(Request $request): Response
    {
        $sampleUser = AppUser::latest()->first();
        $sampleStories = Story::with('scenes')->get();

        return Inertia::render('admin/api-docs', [
            'baseUrl' => url('/api/v1/monitoring'),
            'apiKey' => config('services.donggo.api_key') ?: env('DONGGO_API_KEY', 'donggo_secret_key_2026_xyz'),
            'sampleUser' => $sampleUser,
            'stories' => $sampleStories,
        ]);
    }
}
