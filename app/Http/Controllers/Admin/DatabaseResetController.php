<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\VideoPlayLog;
use App\Models\VoiceReplacementLog;
use Database\Seeders\DonggoSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class DatabaseResetController extends Controller
{
    /**
     * Hard delete / wipe all monitoring telemetry data (AppUsers, VideoPlayLogs, VoiceReplacementLogs).
     * This permanently removes records so the database is clean and ready for real Android data.
     */
    public function wipeData(Request $request): RedirectResponse
    {
        $request->validate([
            'confirmation' => ['required', 'string', 'in:RESET,reset'],
        ]);

        try {
            Schema::disableForeignKeyConstraints();

            // Truncate telemetry and learner tables (Hard permanent delete)
            VoiceReplacementLog::truncate();
            VideoPlayLog::truncate();
            AppUser::truncate();

            Schema::enableForeignKeyConstraints();

            return back()->with('success', 'Semua data telemetri & data siswa berhasil DIHAPUS TOTAL (Hard Purge). Database kini bersih dari nol.');
        } catch (\Throwable $e) {
            Schema::enableForeignKeyConstraints();
            return back()->with('error', 'Gagal mereset data: ' . $e->getMessage());
        }
    }

    /**
     * Reset and re-populate the database with demo sample data (DonggoSeeder).
     */
    public function reseedData(Request $request): RedirectResponse
    {
        $request->validate([
            'confirmation' => ['required', 'string', 'in:RESET,reset'],
        ]);

        try {
            Schema::disableForeignKeyConstraints();

            VoiceReplacementLog::truncate();
            VideoPlayLog::truncate();
            AppUser::truncate();

            Schema::enableForeignKeyConstraints();

            // Run DonggoSeeder to repopulate starter data
            $seeder = new DonggoSeeder();
            $seeder->run();

            return back()->with('success', 'Data berhasil direset dan diisi ulang dengan data sampel awal (7 Siswa, 81 Play, 49 Dubbing).');
        } catch (\Throwable $e) {
            Schema::enableForeignKeyConstraints();
            return back()->with('error', 'Gagal memuat ulang data seeder: ' . $e->getMessage());
        }
    }
}
