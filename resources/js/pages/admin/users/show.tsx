import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    ArrowLeft,
    PlaySquare,
    Mic,
    Clock,
    Layers
} from 'lucide-react';

interface UserShowProps {
    user: {
        id: number;
        device_id: string | null;
        name: string;
        age: string | null;
        gender: string | null;
        education_level: string | null;
        education_class: string | null;
        gorontalo_frequency: string | null;
        app_goal: string | null;
        age_phase: string | null;
        extra_metadata: any;
        created_at: string;
    };
    summary: {
        total_plays: number;
        total_voices: number;
        distinct_stories_played: number;
        distinct_scenes_dubbed: number;
    };
    video_plays: Array<{
        story_title: string;
        scene_title: string;
        video_name: string | null;
        play_count: number;
        total_duration_seconds: number;
        last_played_at: string | null;
    }>;
    voice_replacements: Array<{
        story_title: string;
        scene_title: string;
        action_type: string;
        total_replacements: number;
        last_recorded_at: string | null;
    }>;
    timeline: Array<{
        id: string;
        type: 'play' | 'voice';
        title: string;
        subtitle: string;
        badge: string;
        detail: string;
        timestamp: string;
    }>;
}

export default function UserShow({ user, summary, video_plays, voice_replacements, timeline }: UserShowProps) {
    const [activeTab, setActiveTab] = useState<'matrix' | 'timeline'>('matrix');

    return (
        <AdminLayout
            title={`Monitoring Siswa: ${user.name}`}
            subtitle="Data profil demografi, statistik pemutaran video, dan rekap dubbing suara per scene"
            actions={
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors shadow-2xs"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Daftar</span>
                </Link>
            }
        >
            <Head title={`Monitoring ${user.name} - Donggo`} />

            {/* 1. Demographics Profile Card */}
            <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-stone-900">{user.name}</h2>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                                ID #{user.id}
                            </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                                <span className="text-stone-400 block">Jenjang & Kelas:</span>
                                <span className="font-semibold text-stone-800">{user.education_level || '-'} ({user.education_class || '-'})</span>
                            </div>
                            <div>
                                <span className="text-stone-400 block">Fase Usia:</span>
                                <span className="font-semibold text-stone-800">{user.age ? `${user.age} Thn` : '-'} • {user.age_phase || '-'}</span>
                            </div>
                            <div>
                                <span className="text-stone-400 block">B. Gorontalo:</span>
                                <span className="font-semibold text-stone-800">{user.gorontalo_frequency || '-'}</span>
                            </div>
                            <div>
                                <span className="text-stone-400 block">Device ID:</span>
                                <span className="font-mono text-stone-600 text-[11px] truncate block">{user.device_id || '-'}</span>
                            </div>
                        </div>
                        {user.app_goal && (
                            <div className="mt-3 text-xs text-stone-600">
                                <span className="text-stone-400">Tujuan Belajar: </span>
                                <span className="font-medium text-stone-800">{user.app_goal}</span>
                            </div>
                        )}
                    </div>

                    {/* Summary Boxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-center min-w-[80px]">
                            <div className="text-xl font-bold text-stone-900">{summary.total_plays}x</div>
                            <div className="text-[10px] text-stone-500 font-medium">Play Video</div>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-center min-w-[80px]">
                            <div className="text-xl font-bold text-orange-900">{summary.total_voices}x</div>
                            <div className="text-[10px] text-orange-700 font-medium">Dubbing</div>
                        </div>
                        <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-center min-w-[80px]">
                            <div className="text-xl font-bold text-stone-900">{summary.distinct_stories_played}</div>
                            <div className="text-[10px] text-stone-500 font-medium">Cerita</div>
                        </div>
                        <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-center min-w-[80px]">
                            <div className="text-xl font-bold text-stone-900">{summary.distinct_scenes_dubbed}</div>
                            <div className="text-[10px] text-stone-500 font-medium">Scene Dub</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <button
                    onClick={() => setActiveTab('matrix')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        activeTab === 'matrix'
                            ? 'bg-stone-900 text-white'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Rekap Video & Dubbing</span>
                </button>

                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        activeTab === 'timeline'
                            ? 'bg-stone-900 text-white'
                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timeline Aktivitas ({timeline.length})</span>
                </button>
            </div>

            {activeTab === 'matrix' ? (
                <div className="space-y-6">
                    {/* Video Plays Table */}
                    <div className="rounded-xl bg-white border border-stone-200 overflow-hidden shadow-2xs">
                        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <span className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                                <PlaySquare className="w-3.5 h-3.5 text-stone-500" />
                                <span>Rekap Pemutaran Video Animasi</span>
                            </span>
                            <span className="text-[11px] text-stone-500 font-medium">{video_plays.length} Scene</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-100">
                                        <th className="py-2.5 px-4">Cerita & Scene</th>
                                        <th className="py-2.5 px-4">Nama File Video</th>
                                        <th className="py-2.5 px-4 text-center">Diputar</th>
                                        <th className="py-2.5 px-4 text-center">Total Durasi</th>
                                        <th className="py-2.5 px-4 text-right">Terakhir Diputar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {video_plays.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-stone-400 text-xs">
                                                Belum ada data pemutaran video.
                                            </td>
                                        </tr>
                                    ) : (
                                        video_plays.map((play, i) => (
                                            <tr key={i} className="hover:bg-stone-50 transition-colors">
                                                <td className="py-2.5 px-4">
                                                    <div className="font-semibold text-stone-900">{play.scene_title}</div>
                                                    <div className="text-[11px] text-stone-500">{play.story_title}</div>
                                                </td>
                                                <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500">
                                                    {play.video_name || '-'}
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-semibold text-stone-900">
                                                    {play.play_count}x
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-mono text-stone-600">
                                                    {play.total_duration_seconds} dtk
                                                </td>
                                                <td className="py-2.5 px-4 text-right text-stone-500">
                                                    {play.last_played_at ? new Date(play.last_played_at).toLocaleString('id-ID') : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Voice Replacements Table */}
                    <div className="rounded-xl bg-white border border-stone-200 overflow-hidden shadow-2xs">
                        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <span className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                                <Mic className="w-3.5 h-3.5 text-orange-600" />
                                <span>Rekap Interaktivitas Dubbing Suara</span>
                            </span>
                            <span className="text-[11px] text-stone-500 font-medium">{voice_replacements.length} Scene</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-100">
                                        <th className="py-2.5 px-4">Cerita & Scene Didubbing</th>
                                        <th className="py-2.5 px-4">Tipe Aksi</th>
                                        <th className="py-2.5 px-4 text-center">Jumlah Ganti Suara</th>
                                        <th className="py-2.5 px-4 text-right">Terakhir Direkam</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {voice_replacements.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-stone-400 text-xs">
                                                Belum ada rekaman pergantian suara.
                                            </td>
                                        </tr>
                                    ) : (
                                        voice_replacements.map((voice, i) => (
                                            <tr key={i} className="hover:bg-stone-50 transition-colors">
                                                <td className="py-2.5 px-4">
                                                    <div className="font-semibold text-stone-900">{voice.scene_title}</div>
                                                    <div className="text-[11px] text-stone-500">{voice.story_title}</div>
                                                </td>
                                                <td className="py-2.5 px-4">
                                                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[10px]">
                                                        {voice.action_type}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 text-center font-semibold text-orange-700">
                                                    {voice.total_replacements}x
                                                </td>
                                                <td className="py-2.5 px-4 text-right text-stone-500">
                                                    {voice.last_recorded_at ? new Date(voice.last_recorded_at).toLocaleString('id-ID') : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* Timeline */
                <div className="p-6 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-4">
                    {timeline.length === 0 ? (
                        <div className="text-center py-10 text-xs text-stone-400">
                            Belum ada riwayat aktivitas.
                        </div>
                    ) : (
                        timeline.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs">
                                <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
                                    {item.type === 'voice' ? <Mic className="w-3.5 h-3.5" /> : <PlaySquare className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 pb-3 border-b border-stone-100 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-stone-900">{item.title}</span>
                                        <span className="text-[11px] text-stone-400 font-mono">{item.timestamp}</span>
                                    </div>
                                    <div className="text-stone-600 mt-0.5">{item.subtitle}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
