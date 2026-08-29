import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Film,
    Activity,
    Code2,
    FileSpreadsheet,
    LogOut,
    ExternalLink,
    Menu,
    X,
    ChevronRight,
    User
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export default function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
    const { url, props } = usePage();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const authUser = (props as any).auth?.user || { name: 'Admin Donggo', email: 'admin@donggo.id' };

    const navItems = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
            active: url === '/admin' || url.startsWith('/admin/dashboard'),
        },
        {
            name: 'Data Siswa & Monitoring',
            href: '/admin/users',
            icon: Users,
            active: url.startsWith('/admin/users'),
        },
        {
            name: 'Log Aktivitas',
            href: '/admin/logs',
            icon: Activity,
            active: url.startsWith('/admin/logs'),
        },
        {
            name: 'Dokumentasi & Sandbox API',
            href: '/admin/api-docs',
            icon: Code2,
            active: url.startsWith('/admin/api-docs'),
        },
    ];

    return (
        <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col md:flex-row font-sans antialiased">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 z-50">
                <Link href="/admin/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white text-sm">
                        D
                    </div>
                    <span className="font-bold text-base tracking-tight text-stone-900">
                        Donggo <span className="text-xs font-normal text-stone-500">Admin</span>
                    </span>
                </Link>
                <button
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
                >
                    {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 left-0 h-screen w-60 bg-white border-r border-stone-200 flex flex-col z-40 transition-transform duration-200 md:translate-x-0 ${
                    mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <Link href="/admin/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                            D
                        </div>
                        <div>
                            <div className="font-bold text-sm tracking-tight text-stone-900 leading-tight">
                                Donggo
                            </div>
                            <p className="text-[11px] text-stone-500 font-medium">Monitoring System</p>
                        </div>
                    </Link>
                </div>

                {/* Nav Links */}
                <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-stone-400">
                        Navigasi
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileNavOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                                    item.active
                                        ? 'bg-orange-50/80 text-orange-900 font-semibold border border-orange-200/60'
                                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                }`}
                            >
                                <Icon
                                    className={`w-4 h-4 ${
                                        item.active ? 'text-orange-600' : 'text-stone-400'
                                    }`}
                                />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-5 px-3 pb-2 text-[10px] font-semibold tracking-wider uppercase text-stone-400">
                        Laporan & CSV
                    </div>

                    <a
                        href="/admin/export/users"
                        download
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-stone-400" />
                        <span>Ekspor Data Siswa</span>
                    </a>

                    <a
                        href="/admin/export/logs"
                        download
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-stone-400" />
                        <span>Ekspor Log Aktivitas</span>
                    </a>
                </div>

                {/* Footer Section */}
                <div className="p-3 border-t border-stone-100 space-y-2 bg-stone-50/50">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-xs text-stone-700 font-medium transition-colors shadow-2xs group"
                    >
                        <span>Halaman Utama Game</span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700" />
                    </Link>

                    {/* Admin User Profile */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-stone-200 shadow-2xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center text-stone-600 text-xs font-semibold shrink-0">
                                <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                                <div className="text-xs font-semibold text-stone-900 truncate">{authUser.name}</div>
                                <div className="text-[10px] text-stone-500 truncate">{authUser.email}</div>
                            </div>
                        </div>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Keluar"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 flex flex-col bg-[#fafaf9]">
                {/* Topbar */}
                <header className="px-6 py-3.5 border-b border-stone-200/80 bg-white sticky top-0 z-30 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                            <Link href="/admin/dashboard" className="hover:text-stone-900">Admin</Link>
                            <ChevronRight className="w-3 h-3 text-stone-400" />
                            <span className="text-stone-800 font-semibold">{title || 'Monitoring'}</span>
                        </div>
                        {title && <h1 className="text-lg font-bold text-stone-900 tracking-tight mt-0.5">{title}</h1>}
                        {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>API Sinkronisasi Aktif</span>
                        </div>
                        {actions}
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
