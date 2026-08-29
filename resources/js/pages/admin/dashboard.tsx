import React, { useState } from 'react';
import { Head, Link, usePage, usePoll } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import ResetDataModal from '@/components/ResetDataModal';
import {
    Users,
    PlaySquare,
    Mic,
    BookOpen,
    ArrowUpRight,
    PauseCircle,
    PlayCircle,
    Download,
    RotateCcw,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

interface DashboardProps {
    stats: {
        total_users: number;
        total_video_plays: number;
        total_voice_replacements: number;
        total_stories: number;
    };
    chart_days: Array<{
        date: string;
        plays: number;
        voices: number;
    }>;
    top_played_stories: Array<{
        story_title: string;
        total_plays: number;
    }>;
    top_dubbed_scenes: Array<{
        story_title: string;
        scene_title: string;
        total_dubbed: number;
    }>;
    education_distribution: Array<{
        education_level: string;
        count: number;
    }>;
    gorontalo_frequency_distribution: Array<{
        gorontalo_frequency: string;
        count: number;
    }>;
    age_phase_distribution: Array<{
        age_phase: string;
        count: number;
    }>;
    recent_activities: Array<{
        id: string;
        type: 'play' | 'voice';
        user_name: string;
        story_title: string;
        scene_title: string;
        detail: string;
        timestamp: string;
    }>;
}

export default function Dashboard({
    stats,
    chart_days,
    top_played_stories,
    top_dubbed_scenes,
    education_distribution,
    gorontalo_frequency_distribution,
    age_phase_distribution,
    recent_activities,
}: DashboardProps) {
    const { props } = usePage();
    const flash = (props as any).flash || {};
    const [isPollingActive, setIsPollingActive] = useState(true);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const { start, stop } = usePoll(6000, {
        only: ['stats', 'chart_days', 'recent_activities', 'top_played_stories', 'top_dubbed_scenes'],
    }, {
        autoStart: true,
    });

    const togglePolling = () => {
        if (isPollingActive) {
            stop();
            setIsPollingActive(false);
        } else {
            start();
            setIsPollingActive(true);
        }
    };

    const maxChartValue = Math.max(
        ...chart_days.map((d) => Math.max(d.plays, d.voices)),
        10
    );

    return (
        <AdminLayout
            title="Ringkasan Analitik & Monitoring"
            subtitle="Data telemetri pemutaran video, frekuensi dubbing suara, dan profil pengguna"
            actions={
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePolling}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            isPollingActive
                                ? 'bg-stone-100 border-stone-300 text-stone-800'
                                : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                    >
                        {isPollingActive ? (
                            <>
                                <PauseCircle className="w-3.5 h-3.5 text-stone-600" />
                                <span>Auto-Sync Aktif</span>
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-3.5 h-3.5 text-stone-400" />
                                <span>Auto-Sync Dijeda</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setIsResetModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs border border-stone-300 transition-colors shadow-2xs cursor-pointer"
                        title="Opsi Reset Database"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                        <span>Reset Data</span>
                    </button>

                    <a
                        href="/admin/export/users"
                        download
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors shadow-2xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Ekspor Laporan</span>
                    </a>
                </div>
            }
        >
            <Head title="Admin Dashboard - Donggo" />

            {/* Flash Messages */}
            {flash.success && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                </div>
            )}
            {flash.error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                </div>
            )}

            {/* Reset Data Modal */}
            <ResetDataModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
            />

            {/* 1. Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Learners */}
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Siswa</span>
                        <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center text-stone-600">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-stone-900 tracking-tight">{stats.total_users}</div>
                        <div className="text-xs text-stone-500 mt-0.5">Pengguna terdaftar di aplikasi</div>
                    </div>
                    <Link
                        href="/admin/users"
                        className="inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 font-semibold pt-1"
                    >
                        <span>Lihat data siswa</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Total Video Plays */}
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Pemutaran Video</span>
                        <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center text-stone-600">
                            <PlaySquare className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-stone-900 tracking-tight">{stats.total_video_plays}</div>
                        <div className="text-xs text-stone-500 mt-0.5">Total play per scene animasi</div>
                    </div>
                    <Link
                        href="/admin/logs?type=play"
                        className="inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 font-semibold pt-1"
                    >
                        <span>Lihat log pemutaran</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Total Voice Replacements */}
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sesi Dubbing</span>
                        <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center text-stone-600">
                            <Mic className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-stone-900 tracking-tight">{stats.total_voice_replacements}</div>
                        <div className="text-xs text-stone-500 mt-0.5">Pergantian suara karakter</div>
                    </div>
                    <Link
                        href="/admin/logs?type=voice"
                        className="inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 font-semibold pt-1"
                    >
                        <span>Lihat rekaman dubbing</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* 2. Chart & Recent Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 7-Day Chart */}
                <div className="lg:col-span-8 p-6 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                            <div>
                                <h3 className="font-bold text-sm text-stone-900">Aktivitas 7 Hari Terakhir</h3>
                                <p className="text-xs text-stone-500">Perbandingan jumlah video diputar dan pergantian suara dubbing</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-stone-600">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-orange-600"></span>
                                    <span>Play Video</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-stone-700"></span>
                                    <span>Dubbing Suara</span>
                                </div>
                            </div>
                        </div>

                        {/* Bar chart */}
                        <div className="h-48 flex items-end justify-between gap-3 border-b border-stone-100 pb-2">
                            {chart_days.map((day, idx) => {
                                const playHeight = Math.max(8, Math.round((day.plays / maxChartValue) * 140));
                                const voiceHeight = Math.max(8, Math.round((day.voices / maxChartValue) * 140));

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex items-end justify-center gap-1 h-36">
                                            {/* Play bar */}
                                            <div
                                                style={{ height: `${playHeight}px` }}
                                                className="w-full max-w-[14px] bg-orange-600 rounded-t-xs"
                                                title={`${day.date}: ${day.plays} Play`}
                                            />
                                            {/* Voice bar */}
                                            <div
                                                style={{ height: `${voiceHeight}px` }}
                                                className="w-full max-w-[14px] bg-stone-700 rounded-t-xs"
                                                title={`${day.date}: ${day.voices} Dubbing`}
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-stone-500">{day.date}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between text-xs text-stone-500">
                        <span>Sinkronisasi otomatis setiap 6 detik</span>
                        <span className="font-mono text-[11px]">REST API v1</span>
                    </div>
                </div>

                {/* Recent Feed */}
                <div className="lg:col-span-4 p-6 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-stone-900">Aktivitas Terkini</h3>
                        <Link href="/admin/logs" className="text-xs font-semibold text-orange-700 hover:underline">
                            Semua
                        </Link>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[290px] flex-1 pr-1">
                        {recent_activities.length === 0 ? (
                            <div className="text-center py-10 text-xs text-stone-400">
                                Belum ada aktivitas tercatat.
                            </div>
                        ) : (
                            recent_activities.map((act) => (
                                <div
                                    key={act.id}
                                    className="p-3 rounded-lg border border-stone-100 bg-stone-50/70 space-y-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-xs text-stone-900 truncate max-w-[140px]">
                                            {act.user_name}
                                        </span>
                                        <span className="text-[10px] text-stone-400 font-mono">
                                            {act.timestamp}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-stone-600 truncate">
                                        {act.story_title} • <span className="text-stone-500">{act.scene_title}</span>
                                    </div>
                                    <div className="pt-1 flex items-center gap-1.5">
                                        <span
                                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                                                act.type === 'voice'
                                                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                                                    : 'bg-orange-50 text-orange-900 border-orange-200'
                                            }`}
                                        >
                                            {act.type === 'voice' ? 'Dubbing' : 'Video Play'}
                                        </span>
                                        <span className="text-[10px] text-stone-500 font-mono">{act.detail}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Breakdown Matrix Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Stories */}
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
                        Cerita Paling Banyak Diputar
                    </h3>
                    <div className="space-y-2">
                        {top_played_stories.length === 0 ? (
                            <div className="text-center py-6 text-xs text-stone-400">
                                Belum ada pemutaran tercatat.
                            </div>
                        ) : (
                            top_played_stories.map((story, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100 text-xs">
                                    <span className="font-medium text-stone-800 truncate pr-2">{story.story_title}</span>
                                    <span className="font-bold text-stone-900 shrink-0">{story.total_plays}x</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Dubbed */}
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
                        Scene Paling Sering Didubbing
                    </h3>
                    <div className="space-y-2">
                        {top_dubbed_scenes.length === 0 ? (
                            <div className="text-center py-6 text-xs text-stone-400">
                                Belum ada dubbing tercatat.
                            </div>
                        ) : (
                            top_dubbed_scenes.map((scene, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100 text-xs">
                                    <div className="truncate pr-2">
                                        <div className="font-medium text-stone-800 truncate">{scene.scene_title}</div>
                                        <div className="text-[10px] text-stone-500 truncate">{scene.story_title}</div>
                                    </div>
                                    <span className="font-bold text-orange-700 shrink-0">{scene.total_dubbed}x</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Demographics */}
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
                        Distribusi Bahasa Gorontalo
                    </h3>
                    <div className="space-y-2 text-xs">
                        {gorontalo_frequency_distribution.length === 0 ? (
                            <div className="text-center py-6 text-xs text-stone-400">
                                Belum ada profil siswa.
                            </div>
                        ) : (
                            gorontalo_frequency_distribution.map((f, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                                    <span className="font-medium text-stone-700">{f.gorontalo_frequency || 'Tidak disebutkan'}</span>
                                    <span className="font-bold text-stone-900">{f.count} siswa</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
