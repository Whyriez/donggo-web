import React, { useState } from 'react';
import { Head, Link, router, usePoll } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Search,
    FileSpreadsheet,
    RotateCcw
} from 'lucide-react';

interface ActivityLogItem {
    id: string;
    type: 'play' | 'voice';
    user_id: number | null;
    user_name: string;
    device_id: string | null;
    story_title: string;
    scene_title: string;
    detail: string;
    metric: string;
    timestamp: string;
}

interface ActivityLogsProps {
    logs: ActivityLogItem[];
    filters: {
        type: string;
        search: string;
    };
    counts: {
        plays: number;
        voices: number;
    };
}

export default function ActivityLogs({ logs, filters, counts }: ActivityLogsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');

    usePoll(5000, {
        only: ['logs', 'counts'],
    });

    const handleFilter = (newType: string) => {
        setType(newType);
        router.get('/admin/logs', { type: newType, search }, { preserveState: true, preserveScroll: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/logs', { type, search }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setType('all');
        router.get('/admin/logs', {}, { preserveState: false });
    };

    return (
        <AdminLayout
            title="Log Aktivitas Real-Time"
            subtitle="Catatan riwayat pemutaran animasi dan pergantian suara dubbing"
            actions={
                <a
                    href="/admin/export/logs"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors shadow-2xs"
                >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Ekspor Log CSV</span>
                </a>
            }
        >
            <Head title="Log Aktivitas - Donggo" />

            {/* Filter Toolbar */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Type Filter Buttons */}
                <div className="flex items-center gap-1.5 w-full md:w-auto">
                    <button
                        onClick={() => handleFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            type === 'all'
                                ? 'bg-stone-900 text-white font-semibold'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                    >
                        Semua ({counts.plays + counts.voices})
                    </button>

                    <button
                        onClick={() => handleFilter('play')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            type === 'play'
                                ? 'bg-stone-900 text-white font-semibold'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                    >
                        Play Video ({counts.plays})
                    </button>

                    <button
                        onClick={() => handleFilter('voice')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            type === 'voice'
                                ? 'bg-orange-600 text-white font-semibold'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                    >
                        Dubbing ({counts.voices})
                    </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari user, cerita, scene..."
                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 placeholder-stone-400 font-medium"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Reset"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200">
                                <th className="py-3 px-4">Waktu</th>
                                <th className="py-3 px-4">Aksi</th>
                                <th className="py-3 px-4">Siswa</th>
                                <th className="py-3 px-4">Cerita & Scene</th>
                                <th className="py-3 px-4">Keterangan</th>
                                <th className="py-3 px-4 text-right">Metrik</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-stone-400 text-xs">
                                        Tidak ada log aktivitas ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                                        <td className="py-3 px-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                                            {log.timestamp}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                                                    log.type === 'voice'
                                                        ? 'bg-orange-50 text-orange-900 border-orange-200'
                                                        : 'bg-stone-100 text-stone-700 border-stone-200'
                                                }`}
                                            >
                                                {log.type === 'voice' ? 'Dubbing' : 'Play'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {log.user_id ? (
                                                <Link
                                                    href={`/admin/users/${log.user_id}`}
                                                    className="font-semibold text-stone-900 hover:text-orange-700 transition-colors"
                                                >
                                                    {log.user_name}
                                                </Link>
                                            ) : (
                                                <span className="text-stone-600">{log.user_name}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-stone-800">{log.scene_title}</div>
                                            <div className="text-[10px] text-stone-500">{log.story_title}</div>
                                        </td>
                                        <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                                            {log.detail}
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-stone-900 font-mono text-[11px]">
                                            {log.metric}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
