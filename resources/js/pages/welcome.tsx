import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Mic,
    Play,
    Pause,
    BookOpen,
    Download,
    ShieldCheck,
    Volume2,
    Smartphone,
    Activity,
    Layers,
    ArrowRight,
    Check,
    Headphones,
    SlidersHorizontal,
    Tv
} from 'lucide-react';

interface WelcomeProps {
    stats: {
        total_users: number;
        total_plays: number;
        total_voices: number;
        total_stories: number;
    };
    featured_stories: Array<{
        id: number;
        title: string;
        slug: string;
        category: string;
        description: string;
        total_scenes: number;
        scenes: Array<{
            id: number;
            scene_number: number;
            title: string;
            character_name: string | null;
            gorontalo_script: string | null;
            indonesian_translation: string | null;
        }>;
    }>;
}

export default function Welcome({ stats, featured_stories }: WelcomeProps) {
    const { props } = usePage();
    const authUser = (props as any).auth?.user;

    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
    const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
    const [voiceTrack, setVoiceTrack] = useState<'original' | 'dubbed'>('original');
    const [isPlaying, setIsPlaying] = useState(false);

    const stories = (featured_stories && featured_stories.length > 0) ? featured_stories : [
        {
            id: 1,
            title: 'Legenda Lahilote (Batu Pohe)',
            slug: 'legenda-lahilote',
            category: 'Cerita Rakyat Gorontalo',
            description: 'Kisah Lahilote yang bertemu dengan putri bidadari di mata air hulu sungai Gorontalo.',
            total_scenes: 2,
            scenes: [
                {
                    id: 101,
                    scene_number: 1,
                    title: 'Scene 1: Pertemuan di Mata Air',
                    character_name: 'Lahilote',
                    gorontalo_script: 'Oliyo ta mohelato, wau yilowali mota to hungayo.',
                    indonesian_translation: 'Dia sangat rupawan dan anggun, aku terpesona di tepi sungai.',
                },
                {
                    id: 102,
                    scene_number: 2,
                    title: 'Scene 2: Selendang Yang Disembunyikan',
                    character_name: 'Putri Bidadari',
                    gorontalo_script: 'Tolianggu ma ilowali, wau dila mowali tumomboto ode kayangan.',
                    indonesian_translation: 'Selendangku telah hilang, aku tidak bisa lagi terbang kembali ke kayangan.',
                },
            ],
        },
    ];

    const currentStory = stories[selectedStoryIndex] || stories[0];
    const currentScene = currentStory.scenes[selectedSceneIndex] || currentStory.scenes[0];

    return (
        <div className="min-h-screen bg-[#fafaf9] text-stone-900 font-sans antialiased">
            <Head title="Donggo - Media Pembelajaran Animasi & Dubbing Suara Bahasa Gorontalo" />

            {/* Clean, Non-Gimmick Top Navigation */}
            <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                            D
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base tracking-tight text-stone-900 leading-tight">
                                Donggo
                            </span>
                            <span className="text-[11px] text-stone-500 font-medium">
                                Bahasa Gorontalo Interaktif
                            </span>
                        </div>
                    </Link>

                    {/* Nav Items */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
                        <a href="#simulator" className="hover:text-stone-900 transition-colors">
                            Studio Dubbing
                        </a>
                        <a href="#cerita" className="hover:text-stone-900 transition-colors">
                            Katalog Cerita
                        </a>
                        <a href="#monitoring" className="hover:text-stone-900 transition-colors">
                            Sistem Monitoring
                        </a>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={authUser ? '/admin/dashboard' : '/login'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors shadow-2xs"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                            <span>{authUser ? 'Dashboard Admin' : 'Portal Admin'}</span>
                        </Link>

                        <a
                            href="#unduh"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh APK</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* 1. Hero Section */}
            <section className="pt-16 pb-20 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left: Value Proposition */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-100 text-orange-900 text-xs font-semibold">
                            <span>Aplikasi Android Interaktif</span>
                            <span className="text-orange-400">•</span>
                            <span>Pelestarian Bahasa Daerah</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.2]">
                            Belajar Bahasa Gorontalo Lewat Animasi & Rekaman Suara Sendiri
                        </h1>

                        <p className="text-base text-stone-600 leading-relaxed max-w-xl">
                            <strong>Donggo</strong> adalah platform edukasi berbasis cerita rakyat animasi khas Gorontalo. Di setiap adegan, siswa dapat mengganti dialog tokoh kartun dengan rekaman suaranya sendiri sehingga menghasilkan video cerita utuh karya mereka.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <a
                                href="#simulator"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors shadow-xs"
                            >
                                <Mic className="w-4 h-4" />
                                <span>Coba Studio Dubbing</span>
                            </a>

                            <Link
                                href={authUser ? '/admin/dashboard' : '/login'}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-sm transition-colors shadow-2xs"
                            >
                                <Activity className="w-4 h-4 text-stone-500" />
                                <span>Dashboard Guru & Peneliti</span>
                            </Link>
                        </div>

                        {/* Real Stats Row */}
                        <div className="pt-8 border-t border-stone-200 grid grid-cols-3 gap-6 max-w-md">
                            <div>
                                <div className="text-2xl font-bold text-stone-900">{stats.total_users || 7}</div>
                                <div className="text-xs text-stone-500 font-medium mt-0.5">Siswa Terdaftar</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-700">{stats.total_plays || 80}</div>
                                <div className="text-xs text-stone-500 font-medium mt-0.5">Pemutaran Video</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-stone-800">{stats.total_voices || 49}</div>
                                <div className="text-xs text-stone-500 font-medium mt-0.5">Sesi Dubbing Suara</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Realistic Device/Product Mockup */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm space-y-4">
                            {/* Mock Player Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-semibold text-stone-700 ml-1">
                                        Donggo Android Player
                                    </span>
                                </div>
                                <span className="text-[11px] font-mono text-stone-400">1080p • 60 FPS</span>
                            </div>

                            {/* Scene Visual Frame */}
                            <div className="rounded-xl bg-stone-900 p-5 text-white flex flex-col justify-between h-56 relative overflow-hidden">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-orange-300 flex items-center gap-1.5">
                                        <Tv className="w-3.5 h-3.5" />
                                        <span>Lahilote • Scene 1</span>
                                    </span>
                                    <span className="bg-stone-800 px-2 py-0.5 rounded text-[10px] font-mono text-stone-300">
                                        00:45
                                    </span>
                                </div>

                                <div className="text-center space-y-1.5 my-auto">
                                    <div className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                                        Dialog Karakter
                                    </div>
                                    <div className="text-sm font-bold text-white">
                                        "Oliyo ta mohelato, wau yilowali mota to hungayo."
                                    </div>
                                    <div className="text-xs text-stone-400">
                                        (Dia sangat rupawan, aku terpesona di tepi sungai)
                                    </div>
                                </div>

                                {/* Scrubber bar */}
                                <div className="space-y-1">
                                    <div className="w-full bg-stone-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-orange-500 h-full w-2/3 rounded-full" />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                                        <span>00:30</span>
                                        <span>00:45</span>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Dubbing Status Card */}
                            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
                                        <Mic className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-stone-900">
                                            Status Dubbing Siswa
                                        </div>
                                        <div className="text-[11px] text-stone-500">
                                            Tercatat 4x pergantian suara
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                    Tersinkronisasi
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Interactive Studio Dubbing Section */}
            <section id="simulator" className="py-16 bg-white border-y border-stone-200 px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                            Simulasi Studio Dubbing Suara
                        </h2>
                        <p className="text-sm text-stone-600 max-w-lg mx-auto">
                            Pilih cerita rakyat dan scene di bawah ini untuk mencoba naskah bahasa Gorontalo dan simulasi pergantian track suara.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-[#fafaf9] p-6 space-y-6">
                        {/* 1. Pilih Cerita */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                                1. Pilih Judul Cerita:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                {stories.map((s, idx) => (
                                    <button
                                        key={s.id || idx}
                                        onClick={() => {
                                            setSelectedStoryIndex(idx);
                                            setSelectedSceneIndex(0);
                                            setIsPlaying(false);
                                        }}
                                        className={`p-3 rounded-lg text-left text-xs transition-colors border cursor-pointer ${
                                            selectedStoryIndex === idx
                                                ? 'bg-white border-orange-600 text-orange-950 font-bold shadow-xs'
                                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                                        }`}
                                    >
                                        <div className="truncate font-semibold">{s.title}</div>
                                        <div className="text-[11px] text-stone-500 mt-0.5">{s.scenes.length} Scene</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Pilih Scene */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                                2. Pilih Scene Animasi:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {currentStory.scenes.map((sc, sIdx) => (
                                    <button
                                        key={sc.id || sIdx}
                                        onClick={() => {
                                            setSelectedSceneIndex(sIdx);
                                            setIsPlaying(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                                            selectedSceneIndex === sIdx
                                                ? 'bg-stone-900 border-stone-900 text-white font-semibold'
                                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                                        }`}
                                    >
                                        {sc.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Dialogue Card & Player Controls */}
                        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                                <div>
                                    <span className="text-xs text-stone-500">Tokoh Cerita: </span>
                                    <strong className="text-xs text-stone-900">{currentScene.character_name || 'Tokoh'}</strong>
                                </div>

                                {/* Track Switcher */}
                                <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50">
                                    <button
                                        onClick={() => setVoiceTrack('original')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                            voiceTrack === 'original'
                                                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                                                : 'text-stone-500 hover:text-stone-900'
                                        }`}
                                    >
                                        Suara Asli Cerita
                                    </button>
                                    <button
                                        onClick={() => setVoiceTrack('dubbed')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                            voiceTrack === 'dubbed'
                                                ? 'bg-orange-600 text-white shadow-2xs font-semibold'
                                                : 'text-stone-500 hover:text-stone-900'
                                        }`}
                                    >
                                        Suara Dubbing Siswa
                                    </button>
                                </div>
                            </div>

                            {/* Dialogue Script Box */}
                            <div className="space-y-1.5">
                                <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                                    Naskah Bahasa Gorontalo:
                                </div>
                                <div className="text-base font-bold text-stone-900">
                                    "{currentScene.gorontalo_script}"
                                </div>
                                <div className="text-xs text-stone-600">
                                    Artinya: "{currentScene.indonesian_translation}"
                                </div>
                            </div>

                            {/* Audio Player Action */}
                            <div className="pt-2 flex items-center gap-3">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                                >
                                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                    <span>
                                        {isPlaying ? 'Jeda Audio' : `Putar Track ${voiceTrack === 'original' ? 'Asli' : 'Dubbing'}`}
                                    </span>
                                </button>

                                {isPlaying && (
                                    <div className="flex items-center gap-2 text-xs text-orange-700 font-medium">
                                        <Volume2 className="w-4 h-4 animate-pulse" />
                                        <span>Memutar suara {voiceTrack === 'original' ? 'bahasa Gorontalo asli' : 'rekaman siswa'}...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Story Catalog Showcase */}
            <section id="cerita" className="py-20 px-6 max-w-6xl mx-auto space-y-10">
                <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                        Katalog Cerita Rakyat Gorontalo
                    </h2>
                    <p className="text-sm text-stone-600 max-w-xl">
                        Naskah animasi disusun dari cerita rakyat dan kebudayaan Gorontalo untuk memperkenalkan kosa kata autentik kepada siswa.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stories.map((st) => (
                        <div
                            key={st.id}
                            className="rounded-xl bg-white border border-stone-200 p-5 flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors"
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[11px] font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                                        {st.category}
                                    </span>
                                    <span className="text-stone-500 font-medium">
                                        {st.scenes.length} Scene
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-stone-900 leading-snug">
                                    {st.title}
                                </h3>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                    {st.description}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                                <span className="text-stone-500 font-medium">Modul Interaktif</span>
                                <a href="#simulator" className="text-orange-600 font-semibold hover:underline">
                                    Lihat Naskah &rarr;
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Monitoring System Explanation */}
            <section id="monitoring" className="py-16 bg-stone-100/70 border-t border-stone-200 px-6">
                <div className="max-w-6xl mx-auto space-y-10">
                    <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                            Fitur Monitoring & Integrasi REST API
                        </h2>
                        <p className="text-sm text-stone-600 max-w-xl">
                            Aplikasi Android mengirimkan telemetry secara terstruktur ke backend Laravel untuk keperluan evaluasi belajar guru dan penelitian.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2.5">
                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-xs">
                                01
                            </div>
                            <h3 className="font-bold text-sm text-stone-900">Profil Demografi Siswa</h3>
                            <p className="text-xs text-stone-600 leading-relaxed">
                                Mencatat data nama, usia, kelas, jenjang pendidikan, fase usia, serta frekuensi penggunaan bahasa Gorontalo sehari-hari.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2.5">
                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-xs">
                                02
                            </div>
                            <h3 className="font-bold text-sm text-stone-900">Frekuensi Pemutaran Video</h3>
                            <p className="text-xs text-stone-600 leading-relaxed">
                                Melacak scene animasi mana yang paling sering ditonton dan berapa lama durasi belajar siswa pada tiap cerita.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-white border border-stone-200 space-y-2.5">
                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-xs">
                                03
                            </div>
                            <h3 className="font-bold text-sm text-stone-900">Metrik Interaktivitas Dubbing</h3>
                            <p className="text-xs text-stone-600 leading-relaxed">
                                Merekam berapa kali siswa mencoba merekam ulang suara per karakter di setiap scene untuk mengukur antusiasme belajar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Download Section */}
            <section id="unduh" className="py-16 px-6 max-w-4xl mx-auto">
                <div className="rounded-2xl bg-stone-900 text-white p-8 sm:p-12 space-y-6">
                    <div className="space-y-2">
                        <span className="text-xs uppercase tracking-wider text-orange-400 font-semibold">
                            Aplikasi Android
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Unduh Aplikasi Donggo di Tablet & Smartphone
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-lg">
                            Dapatkan file APK Android untuk instalasi di perangkat siswa atau laboratorium sekolah.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => alert('File instalasi APK Android Donggo siap diunduh.')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>Unduh APK (Donggo-v1.0.apk)</span>
                        </button>

                        <Link
                            href={authUser ? '/admin/dashboard' : '/login'}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-medium transition-colors"
                        >
                            <ShieldCheck className="w-4 h-4 text-stone-400" />
                            <span>Buka Portal Monitoring</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Clean Footer */}
            <footer className="border-t border-stone-200 py-8 px-6 text-center text-xs text-stone-500 space-y-1 bg-white">
                <div className="font-semibold text-stone-700">
                    Donggo • Media Pembelajaran Animasi & Dubbing Suara Bahasa Gorontalo
                </div>
                <div>
                    &copy; {new Date().getFullYear()} Donggo Project. REST API Backend & Admin Monitoring Dashboard.
                </div>
            </footer>
        </div>
    );
}
