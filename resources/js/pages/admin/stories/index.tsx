import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    ChevronDown,
    ChevronUp,
    Volume2
} from 'lucide-react';

interface SceneData {
    id: number;
    scene_number: number;
    title: string;
    character_name: string | null;
    gorontalo_script: string | null;
    indonesian_translation: string | null;
    video_asset: string | null;
    total_plays: number;
    total_dubbings: number;
    active_learners: number;
}

interface StoryData {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string | null;
    total_scenes: number;
    total_plays: number;
    total_dubbings: number;
    unique_learners: number;
    scenes: SceneData[];
}

interface StoriesIndexProps {
    stories: StoryData[];
}

export default function StoriesIndex({ stories }: StoriesIndexProps) {
    const [expandedStories, setExpandedStories] = useState<Record<number, boolean>>({
        1: true,
        2: true,
        3: true,
        4: true,
    });

    const toggleExpand = (id: number) => {
        setExpandedStories((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <AdminLayout
            title="Katalog Cerita & Matriks Scene"
            subtitle="Daftar naskah percakapan bahasa Gorontalo dan metrik interaktivitas per adegan"
        >
            <Head title="Katalog Cerita & Scene - Donggo" />

            <div className="space-y-4">
                {stories.map((story) => {
                    const isExpanded = expandedStories[story.id] ?? true;

                    return (
                        <div
                            key={story.id}
                            className="rounded-xl bg-white border border-stone-200 overflow-hidden shadow-2xs"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50/50">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-stone-900">{story.title}</h3>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700">
                                            {story.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-500 mt-0.5 max-w-xl">{story.description}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                                        <span><strong>{story.total_plays}x</strong> Play</span>
                                        <span>•</span>
                                        <span className="text-orange-700"><strong>{story.total_dubbings}x</strong> Dubbing</span>
                                        <span>•</span>
                                        <span><strong>{story.unique_learners}</strong> Siswa</span>
                                    </div>

                                    <button
                                        onClick={() => toggleExpand(story.id)}
                                        className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                                        title={isExpanded ? 'Tutup' : 'Buka'}
                                    >
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Scenes List */}
                            {isExpanded && (
                                <div className="p-4 divide-y divide-stone-100 space-y-4">
                                    {story.scenes.map((scene) => (
                                        <div
                                            key={scene.id}
                                            className="pt-4 first:pt-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                        >
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-stone-400">
                                                        Scene {scene.scene_number}:
                                                    </span>
                                                    <span className="font-semibold text-xs text-stone-900">{scene.title}</span>
                                                    {scene.character_name && (
                                                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-stone-100 text-stone-700">
                                                            {scene.character_name}
                                                        </span>
                                                    )}
                                                </div>

                                                {(scene.gorontalo_script || scene.indonesian_translation) && (
                                                    <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 text-xs space-y-1">
                                                        <div className="text-stone-900 font-semibold flex items-center gap-1.5">
                                                            <Volume2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                            <span>"{scene.gorontalo_script}"</span>
                                                        </div>
                                                        <div className="text-stone-500 pl-5 text-[11px]">
                                                            Artinya: "{scene.indonesian_translation}"
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 text-center text-xs">
                                                <div className="p-2 rounded bg-stone-50 border border-stone-100 min-w-[70px]">
                                                    <div className="font-bold text-stone-900">{scene.total_plays}x</div>
                                                    <div className="text-[10px] text-stone-400">Diputar</div>
                                                </div>
                                                <div className="p-2 rounded bg-orange-50 border border-orange-200 min-w-[70px]">
                                                    <div className="font-bold text-orange-900">{scene.total_dubbings}x</div>
                                                    <div className="text-[10px] text-orange-700">Dubbing</div>
                                                </div>
                                                <div className="p-2 rounded bg-stone-50 border border-stone-100 min-w-[70px]">
                                                    <div className="font-bold text-stone-900">{scene.active_learners}</div>
                                                    <div className="text-[10px] text-stone-400">Siswa</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </AdminLayout>
    );
}
