import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Search,
    ChevronRight,
    FileSpreadsheet,
    RotateCcw
} from 'lucide-react';

interface PaginatedUsers {
    data: Array<{
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
        total_video_plays: number;
        total_voice_replacements: number | null;
        created_at: string;
    }>;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    total: number;
    current_page: number;
    last_page: number;
}

interface UsersIndexProps {
    users: PaginatedUsers;
    filters: {
        search: string;
        education_level: string;
        age_phase: string;
        gorontalo_frequency: string;
    };
    options: {
        education_levels: string[];
        age_phases: string[];
        frequencies: string[];
    };
}

export default function UsersIndex({ users, filters, options }: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [educationLevel, setEducationLevel] = useState(filters.education_level || '');
    const [agePhase, setAgePhase] = useState(filters.age_phase || '');
    const [frequency, setFrequency] = useState(filters.gorontalo_frequency || '');

    const handleFilterChange = (newFilters: any) => {
        router.get(
            '/admin/users',
            {
                search: newFilters.search !== undefined ? newFilters.search : search,
                education_level: newFilters.education_level !== undefined ? newFilters.education_level : educationLevel,
                age_phase: newFilters.age_phase !== undefined ? newFilters.age_phase : agePhase,
                gorontalo_frequency: newFilters.gorontalo_frequency !== undefined ? newFilters.gorontalo_frequency : frequency,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ search });
    };

    const handleReset = () => {
        setSearch('');
        setEducationLevel('');
        setAgePhase('');
        setFrequency('');
        router.get('/admin/users', {}, { preserveState: false });
    };

    return (
        <AdminLayout
            title="Daftar Siswa & Pengguna"
            subtitle="Data demografi, pemutaran video animasi, dan rekap dubbing per siswa"
            actions={
                <a
                    href="/admin/export/users"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors shadow-2xs"
                >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Ekspor CSV</span>
                </a>
            }
        >
            <Head title="Data Siswa - Donggo" />

            {/* Filter Toolbar */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2.5">
                    {/* Search */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, kelas, atau device ID..."
                            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-900 placeholder-stone-400 font-medium"
                        />
                    </div>

                    {/* Selects */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <select
                            value={educationLevel}
                            onChange={(e) => {
                                setEducationLevel(e.target.value);
                                handleFilterChange({ education_level: e.target.value });
                            }}
                            className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-700"
                        >
                            <option value="">Semua Jenjang</option>
                            {options.education_levels.map((lvl) => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                        </select>

                        <select
                            value={frequency}
                            onChange={(e) => {
                                setFrequency(e.target.value);
                                handleFilterChange({ gorontalo_frequency: e.target.value });
                            }}
                            className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-700"
                        >
                            <option value="">Semua Frekuensi B. Gorontalo</option>
                            {options.frequencies.map((frq) => (
                                <option key={frq} value={frq}>{frq}</option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Reset Filter"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4">Nama Siswa</th>
                                <th className="py-3 px-4">Jenjang & Kelas</th>
                                <th className="py-3 px-4">B. Gorontalo</th>
                                <th className="py-3 px-4">Tujuan Belajar</th>
                                <th className="py-3 px-4 text-center">Play Video</th>
                                <th className="py-3 px-4 text-center">Dubbing</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-stone-400 text-xs">
                                        Tidak ada data siswa ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                                        {/* Name */}
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-stone-900">{user.name}</div>
                                            <div className="text-[11px] text-stone-500 font-normal">
                                                {user.age ? `${user.age} Thn` : '-'} • {user.gender || '-'}
                                            </div>
                                        </td>

                                        {/* Education */}
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-stone-800">
                                                {user.education_class || user.education_level || '-'}
                                            </div>
                                            <div className="text-[10px] text-stone-500">
                                                {user.age_phase || user.education_level}
                                            </div>
                                        </td>

                                        {/* Gorontalo Frequency */}
                                        <td className="py-3 px-4">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium border border-stone-200 bg-stone-50 text-stone-700">
                                                {user.gorontalo_frequency || '-'}
                                            </span>
                                        </td>

                                        {/* Goal */}
                                        <td className="py-3 px-4 max-w-[200px] truncate text-stone-600">
                                            {user.app_goal || '-'}
                                        </td>

                                        {/* Play count */}
                                        <td className="py-3 px-4 text-center font-semibold text-stone-900">
                                            {user.total_video_plays}x
                                        </td>

                                        {/* Voice count */}
                                        <td className="py-3 px-4 text-center font-semibold text-orange-700">
                                            {user.total_voice_replacements || 0}x
                                        </td>

                                        {/* Action */}
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs transition-colors"
                                            >
                                                <span>Detail</span>
                                                <ChevronRight className="w-3 h-3 text-stone-400" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links.length > 3 && (
                    <div className="p-3.5 border-t border-stone-200 flex items-center justify-between bg-stone-50/50">
                        <div className="text-xs text-stone-500">
                            Menampilkan <strong className="text-stone-800">{users.data.length}</strong> dari{' '}
                            <strong className="text-stone-800">{users.total}</strong> total siswa
                        </div>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                        link.active
                                            ? 'bg-stone-900 text-white font-semibold'
                                            : !link.url
                                            ? 'text-stone-300 pointer-events-none'
                                            : 'text-stone-600 hover:bg-stone-200'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
