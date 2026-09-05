import React, { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Plus,
    Upload,
    RefreshCw,
    FileArchive,
    Image as ImageIcon,
    Film,
    Trash2,
    Edit3,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Volume2,
    X,
    Layers,
    Tv,
    Clock,
    Sparkles,
    Eye,
    ListFilter,
    FolderSync,
    FileJson,
    Info,
    AlertTriangle,
    Loader2,
} from 'lucide-react';

interface DialogueItem {
    id: number;
    startTimeMs: number;
    endTimeMs: number;
    text: string;
    character: string;
}

interface SceneData {
    id: number;
    story_id: number;
    scene_number: number;
    title: string;
    character_name: string | null;
    gorontalo_script: string | null;
    indonesian_translation: string | null;
    video_asset: string | null;
    video_mute_file: string | null;
    audio_original_file: string | null;
    dialogues: DialogueItem[];
    total_plays: number;
    total_dubbings: number;
}

interface StoryData {
    id: number;
    story_code: string;
    slug: string;
    title: string;
    category: string;
    fase: string;
    description: string | null;
    cover_image: string | null;
    cover_url: string | null;
    cover_exists: boolean;
    thumbnail: string | null;
    backsound_file: string | null;
    download_package_url: string | null;
    download_size_bytes: number;
    download_size_formatted: string;
    zip_exists: boolean;
    total_scenes: number;
    total_plays: number;
    total_dubbings: number;
    unique_learners: number;
    scenes: SceneData[];
}

interface AvailableCover {
    name: string;
    size: number;
    url: string;
}

interface AvailablePackage {
    name: string;
    size: number;
    formatted_size: string;
    url: string;
}

interface StoriesIndexProps {
    stories: StoryData[];
    availableCovers: AvailableCover[];
    availablePackages: AvailablePackage[];
    storageStatus: {
        coversDirExists: boolean;
        packagesDirExists: boolean;
        totalPhysicalCovers: number;
        totalPhysicalPackages: number;
    };
}

export default function StoriesIndex({
    stories,
    availableCovers,
    availablePackages,
    storageStatus,
}: StoriesIndexProps) {
    const { flash } = usePage().props as any;

    const [activeTab, setActiveTab] = useState<'management' | 'matrix'>('management');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedStoryScenes, setExpandedStoryScenes] = useState<Record<number, boolean>>({});

    // Modal States
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState<StoryData | null>(null);

    const [scenesModalOpen, setScenesModalOpen] = useState(false);
    const [activeStoryForScenes, setActiveStoryForScenes] = useState<StoryData | null>(null);

    const [sceneFormModalOpen, setSceneFormModalOpen] = useState(false);
    const [editingScene, setEditingScene] = useState<SceneData | null>(null);

    const [isSyncing, setIsSyncing] = useState(false);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

    // Creative Delete Confirmation States
    const [sceneToDelete, setSceneToDelete] = useState<{
        storyId: number;
        storyTitle: string;
        storyCode: string;
        scene: SceneData;
    } | null>(null);
    const [isDeletingScene, setIsDeletingScene] = useState(false);

    const [storyToDelete, setStoryToDelete] = useState<StoryData | null>(null);
    const [isDeletingStory, setIsDeletingStory] = useState(false);

    const [syncModalOpen, setSyncModalOpen] = useState(false);

    // Keep activeStoryForScenes in sync whenever the server re-renders with fresh stories
    useEffect(() => {
        if (activeStoryForScenes) {
            const fresh = stories.find(s => s.id === activeStoryForScenes.id);
            if (fresh) {
                setActiveStoryForScenes(fresh);
            }
        }
    }, [stories]);

    // Import JSON Modal State
    const [importJsonModalOpen, setImportJsonModalOpen] = useState(false);
    const [importMethod, setImportMethod] = useState<'paste' | 'upload'>('paste');

    const importJsonForm = useForm<{
        json_file: File | null;
        json_text: string;
    }>({
        json_file: null,
        json_text: '',
    });

    const sampleJsonTemplate = JSON.stringify([
        {
            "storyId": "story_1",
            "title": "Hemolapula lo Putito",
            "fase": "Fase A",
            "coverImage": "cover_hemolapula_lo_putito",
            "scenes": [
                {
                    "sceneNumber": 1,
                    "videoMuteFile": "story_1_scene_1_video_mute.mp4",
                    "audioOriginalFile": "story_1_scene_1_audio.wav",
                    "dialogues": [
                        {
                            "id": 1,
                            "startTimeMs": 2126,
                            "endTimeMs": 3228,
                            "text": "Te Deka",
                            "character": "Narator"
                        }
                    ]
                },
                {
                    "sceneNumber": 2,
                    "videoMuteFile": "story_1_scene_2_video_mute.mp4",
                    "audioOriginalFile": "story_1_scene_2_audio.wav",
                    "dialogues": [
                        {
                            "id": 1,
                            "startTimeMs": 5064,
                            "endTimeMs": 6442,
                            "text": "To o'ayuwa",
                            "character": "Narator"
                        }
                    ]
                }
            ]
        }
    ], null, 2);

    const handleImportJsonSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        importJsonForm.post('/admin/stories/import-json', {
            forceFormData: true,
            onSuccess: () => {
                setImportJsonModalOpen(false);
                importJsonForm.reset();
            },
        });
    };

    const handleUseSample = () => {
        importJsonForm.setData('json_text', sampleJsonTemplate);
        setImportMethod('paste');
    };

    const handleFormatJson = () => {
        try {
            const parsed = JSON.parse(importJsonForm.data.json_text);
            importJsonForm.setData('json_text', JSON.stringify(parsed, null, 2));
        } catch {
            // Ignore if invalid
        }
    };

    type ParsedJsonInfo =
        | { valid: true; totalStories: number; totalScenes: number; titles: string[]; error?: never }
        | { valid: false; error: string; totalStories?: never; totalScenes?: never; titles?: never };

    const getParsedJsonInfo = (): ParsedJsonInfo | null => {
        if (!importJsonForm.data.json_text.trim()) return null;
        try {
            const parsed = JSON.parse(importJsonForm.data.json_text);
            const arr = Array.isArray(parsed) ? parsed : [parsed];
            const validStories = arr.filter(item => item && (item.title || item.storyId || item.story_code));
            const totalScenes = validStories.reduce((acc, s) => acc + (Array.isArray(s.scenes) ? s.scenes.length : 0), 0);
            return {
                valid: true,
                totalStories: validStories.length,
                totalScenes,
                titles: validStories.map(s => s.title || s.storyId || 'Tanpa Judul'),
            };
        } catch (e: any) {
            return {
                valid: false,
                error: e.message,
            };
        }
    };

    const jsonParsedStatus = getParsedJsonInfo();


    // Story Form
    const storyForm = useForm<{
        title: string;
        story_code: string;
        slug: string;
        category: string;
        fase: string;
        description: string;
        cover_file: File | null;
        existing_cover: string;
        package_file: File | null;
        existing_package: string;
        backsound_file: string;
        _method?: string;
    }>({
        title: '',
        story_code: '',
        slug: '',
        category: 'Cerita Rakyat Gorontalo',
        fase: 'Fase A',
        description: '',
        cover_file: null,
        existing_cover: '',
        package_file: null,
        existing_package: '',
        backsound_file: '',
    });

    // Scene Form
    const sceneForm = useForm<{
        scene_number: number;
        title: string;
        character_name: string;
        gorontalo_script: string;
        indonesian_translation: string;
        video_mute_file: string;
        audio_original_file: string;
        dialogues: DialogueItem[];
        _method?: string;
    }>({
        scene_number: 1,
        title: '',
        character_name: '',
        gorontalo_script: '',
        indonesian_translation: '',
        video_mute_file: '',
        audio_original_file: '',
        dialogues: [],
    });

    // Handle Open Create Story
    const openCreateStoryModal = () => {
        setEditingStory(null);
        setCoverPreviewUrl(null);
        storyForm.reset();
        storyForm.setData({
            title: '',
            story_code: `story_${stories.length + 1}`,
            slug: '',
            category: 'Cerita Rakyat Gorontalo',
            fase: 'Fase A',
            description: '',
            cover_file: null,
            existing_cover: '',
            package_file: null,
            existing_package: '',
            backsound_file: '',
        });
        setStoryModalOpen(true);
    };

    // Handle Open Edit Story
    const openEditStoryModal = (story: StoryData) => {
        setEditingStory(story);
        setCoverPreviewUrl(story.cover_url);
        storyForm.reset();
        storyForm.setData({
            title: story.title,
            story_code: story.story_code,
            slug: story.slug,
            category: story.category,
            fase: story.fase,
            description: story.description || '',
            cover_file: null,
            existing_cover: story.cover_image || '',
            package_file: null,
            existing_package: story.download_package_url ? story.download_package_url.split('/').pop() || '' : '',
            backsound_file: story.backsound_file || '',
        });
        setStoryModalOpen(true);
    };

    // Handle Submit Story
    const handleStorySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingStory) {
            storyForm.transform((data) => ({
                ...data,
                _method: 'PUT',
            }));
            storyForm.post(`/admin/stories/${editingStory.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setStoryModalOpen(false);
                    storyForm.reset();
                },
            });
        } else {
            storyForm.transform((data) => ({
                ...data,
                _method: undefined,
            }));
            storyForm.post('/admin/stories', {
                forceFormData: true,
                onSuccess: () => {
                    setStoryModalOpen(false);
                    storyForm.reset();
                },
            });
        }
    };

    // Handle Delete Story (Opens Creative Modal)
    const handleDeleteStory = (story: StoryData) => {
        setStoryToDelete(story);
    };

    const confirmDeleteStory = () => {
        if (!storyToDelete) return;
        setIsDeletingStory(true);
        router.delete(`/admin/stories/${storyToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setStoryToDelete(null);
            },
            onFinish: () => {
                setIsDeletingStory(false);
            },
        });
    };

    // Handle Sync from Physical Storage (Opens Creative Modal)
    const handleSyncStorage = () => {
        setSyncModalOpen(true);
    };

    const confirmSyncStorage = () => {
        setSyncModalOpen(false);
        setIsSyncing(true);
        router.post('/admin/stories/sync-storage', {}, {
            preserveScroll: true,
            onFinish: () => setIsSyncing(false),
        });
    };

    // Handle Open Scenes Drawer
    const openScenesModal = (story: StoryData) => {
        setActiveStoryForScenes(story);
        setScenesModalOpen(true);
    };

    // Handle Open Create Scene
    const openCreateSceneModal = (story: StoryData) => {
        setEditingScene(null);
        const nextSceneNum = (story.scenes?.length || 0) + 1;
        sceneForm.reset();
        sceneForm.setData({
            scene_number: nextSceneNum,
            title: `Scene ${nextSceneNum}: `,
            character_name: 'Narator',
            gorontalo_script: '',
            indonesian_translation: '',
            video_mute_file: `${story.story_code}_scene_${nextSceneNum}_video_mute.mp4`,
            audio_original_file: `${story.story_code}_scene_${nextSceneNum}_audio.wav`,
            dialogues: [
                {
                    id: 1,
                    startTimeMs: 1000,
                    endTimeMs: 4000,
                    character: 'Narator',
                    text: '',
                },
            ],
        });
        setSceneFormModalOpen(true);
    };

    // Handle Open Edit Scene
    const openEditSceneModal = (scene: SceneData) => {
        setEditingScene(scene);
        sceneForm.reset();
        sceneForm.setData({
            scene_number: scene.scene_number,
            title: scene.title,
            character_name: scene.character_name || '',
            gorontalo_script: scene.gorontalo_script || '',
            indonesian_translation: scene.indonesian_translation || '',
            video_mute_file: scene.video_mute_file || scene.video_asset || '',
            audio_original_file: scene.audio_original_file || '',
            dialogues: scene.dialogues?.length ? scene.dialogues : [],
        });
        setSceneFormModalOpen(true);
    };

    // Handle Submit Scene
    const handleSceneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeStoryForScenes) return;

        if (editingScene) {
            sceneForm.transform((data) => ({
                ...data,
                _method: 'PUT',
            }));
            sceneForm.post(`/admin/stories/${activeStoryForScenes.id}/scenes/${editingScene.id}`, {
                preserveScroll: true,
                onSuccess: (page) => {
                    setSceneFormModalOpen(false);
                    const freshStories = (page.props as any).stories as StoryData[] | undefined;
                    if (freshStories) {
                        const updated = freshStories.find(s => s.id === activeStoryForScenes.id);
                        if (updated) setActiveStoryForScenes(updated);
                    }
                },
            });
        } else {
            sceneForm.transform((data) => ({
                ...data,
                _method: undefined,
            }));
            sceneForm.post(`/admin/stories/${activeStoryForScenes.id}/scenes`, {
                preserveScroll: true,
                onSuccess: (page) => {
                    setSceneFormModalOpen(false);
                    const freshStories = (page.props as any).stories as StoryData[] | undefined;
                    if (freshStories) {
                        const updated = freshStories.find(s => s.id === activeStoryForScenes.id);
                        if (updated) setActiveStoryForScenes(updated);
                    }
                },
            });
        }
    };

    // Handle Request Delete Scene (Opens Creative Modal)
    const requestDeleteScene = (scene: SceneData) => {
        if (!activeStoryForScenes) return;
        setSceneToDelete({
            storyId: activeStoryForScenes.id,
            storyTitle: activeStoryForScenes.title,
            storyCode: activeStoryForScenes.story_code,
            scene,
        });
    };

    // Execute Delete Scene with Instant Optimistic Removal
    const confirmDeleteScene = () => {
        if (!sceneToDelete) return;
        const { storyId, scene } = sceneToDelete;
        setIsDeletingScene(true);

        // 1. Optimistic instant removal from activeStoryForScenes
        setActiveStoryForScenes((prev) => {
            if (!prev || prev.id !== storyId) return prev;
            return {
                ...prev,
                total_scenes: Math.max(0, (prev.total_scenes || 1) - 1),
                scenes: (prev.scenes || []).filter((s) => s.id !== scene.id),
            };
        });

        // 2. Perform Inertia Delete
        router.delete(`/admin/stories/${storyId}/scenes/${scene.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                const freshStories = (page.props as any).stories as StoryData[] | undefined;
                if (freshStories) {
                    const freshActive = freshStories.find((s) => s.id === storyId);
                    if (freshActive) {
                        setActiveStoryForScenes(freshActive);
                    }
                }
                setSceneToDelete(null);
            },
            onError: () => {
                const rollback = stories.find((s) => s.id === storyId);
                if (rollback) setActiveStoryForScenes(rollback);
            },
            onFinish: () => {
                setIsDeletingScene(false);
            },
        });
    };

    // Dialogue Editor Helpers
    const addDialogueRow = () => {
        const currentDialogues = sceneForm.data.dialogues || [];
        const nextId = currentDialogues.length + 1;
        const lastEnd = currentDialogues.length > 0
            ? currentDialogues[currentDialogues.length - 1].endTimeMs
            : 0;

        sceneForm.setData('dialogues', [
            ...currentDialogues,
            {
                id: nextId,
                startTimeMs: lastEnd + 500,
                endTimeMs: lastEnd + 3500,
                character: sceneForm.data.character_name || 'Tokoh',
                text: '',
            },
        ]);
    };

    const removeDialogueRow = (idx: number) => {
        const next = [...(sceneForm.data.dialogues || [])];
        next.splice(idx, 1);
        sceneForm.setData('dialogues', next);
    };

    const updateDialogueRow = (idx: number, field: keyof DialogueItem, value: any) => {
        const next = [...(sceneForm.data.dialogues || [])];
        next[idx] = { ...next[idx], [field]: value };
        sceneForm.setData('dialogues', next);
    };

    const toggleStoryScenesExpand = (id: number) => {
        setExpandedStoryScenes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Filter Stories
    const filteredStories = stories.filter(st => {
        if (selectedCategory === 'all') return true;
        return st.category === selectedCategory;
    });

    const categories = ['all', ...Array.from(new Set(stories.map(s => s.category)))];

    return (
        <AdminLayout
            title="Katalog & Manajemen Cerita"
            subtitle="Pusat kelola cover gambar, paket ZIP offline, video mute MP4, audio WAV, dan naskah cerita Gorontalo"
            actions={
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setImportJsonModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Import banyak cerita & adegan sekaligus dari data JSON"
                    >
                        <FileJson className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Import JSON</span>
                    </button>

                    <button
                        onClick={handleSyncStorage}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
                        title="Scan otomatis cover & ZIP yang ada di disk storage"
                    >
                        <FolderSync className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Aset Storage'}</span>
                    </button>

                    <button
                        onClick={openCreateStoryModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Cerita Baru</span>
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Cerita & Cover Video - Donggo Admin" />

            {/* Flash Message Banner */}
            {flash?.success && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs animate-fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{flash.success}</span>
                    </div>
                </div>
            )}

            {/* Storage Health & Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-500">Cerita di Database</span>
                        <div className="p-1.5 rounded-lg bg-orange-50 text-orange-700">
                            <Film className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-stone-900 mt-2">{stories.length}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Katalog aktif di aplikasi</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-500">Adegan / Scenes</span>
                        <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-stone-900 mt-2">
                        {stories.reduce((acc, s) => acc + (s.scenes?.length || 0), 0)}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Total segmen video & audio</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-500">Cover Fisik Disk</span>
                        <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                            <ImageIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-sky-950 mt-2">
                        {storageStatus.totalPhysicalCovers} <span className="text-xs font-normal text-stone-400">file</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">storage/app/public/covers</div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-500">Paket ZIP Offline</span>
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                            <FileArchive className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-950 mt-2">
                        {storageStatus.totalPhysicalPackages} <span className="text-xs font-normal text-stone-400">paket</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">storage/app/public/packages</div>
                </div>
            </div>

            {/* Quick Helper Notice */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50/70 via-stone-50 to-white border border-orange-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-stone-900">Alur Penyimpanan & Pengunduhan Donggo Android</h4>
                        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                            Aplikasi Android memuat cover visual secara daring melalui URL publik, lalu mengunduh satu paket ZIP per cerita ke penyimpanan internal HP untuk pemutaran video MP4 mute dan dubbing audio 100% luring (offline).
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Tabs & Category Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('management')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            activeTab === 'management'
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`}
                    >
                        Katalog & Pengelolaan Media
                    </button>
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            activeTab === 'matrix'
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`}
                    >
                        Matriks Interaktivitas & Analitik Naskah
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                        <ListFilter className="w-3.5 h-3.5" /> Kategori:
                    </span>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs bg-white text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                        <option value="all">Semua Kategori ({stories.length})</option>
                        {categories.filter(c => c !== 'all').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TAB 1: STORY & MEDIA MANAGEMENT CARDS */}
            {activeTab === 'management' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStories.map((story) => {
                        const hasCover = Boolean(story.cover_url);
                        const hasZip = Boolean(story.zip_exists);

                        return (
                            <div
                                key={story.id}
                                className="rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Cover Image Preview Area */}
                                    <div className="h-44 bg-stone-100 relative overflow-hidden group">
                                        {hasCover ? (
                                            <img
                                                src={story.cover_url!}
                                                alt={story.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    // Fallback on broken image
                                                    (e.target as HTMLElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100 space-y-1">
                                                <ImageIcon className="w-8 h-8 stroke-1" />
                                                <span className="text-[11px] font-medium">Cover belum ada</span>
                                            </div>
                                        )}

                                        {/* Overlay Badges */}
                                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-semibold tracking-wider uppercase">
                                                {story.story_code}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md bg-orange-600/90 backdrop-blur-xs text-white text-[10px] font-semibold">
                                                {story.fase}
                                            </span>
                                        </div>

                                        <div className="absolute top-2.5 right-2.5">
                                            <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-medium border border-stone-200/50 shadow-2xs">
                                                {story.category}
                                            </span>
                                        </div>

                                        {/* Cover Status indicator */}
                                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px]">
                                            <span className={`px-2 py-0.5 rounded backdrop-blur-xs font-semibold flex items-center gap-1 ${
                                                hasCover ? 'bg-emerald-950/80 text-emerald-200' : 'bg-rose-950/80 text-rose-200'
                                            }`}>
                                                {hasCover ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                <span>{hasCover ? story.cover_image : 'Cover Hilang'}</span>
                                            </span>

                                            <span className={`px-2 py-0.5 rounded backdrop-blur-xs font-semibold flex items-center gap-1 ${
                                                hasZip ? 'bg-stone-900/80 text-orange-300 font-mono' : 'bg-amber-950/80 text-amber-200'
                                            }`}>
                                                <FileArchive className="w-3 h-3" />
                                                <span>{hasZip ? story.download_size_formatted : 'No ZIP'}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Story Content Details */}
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1">
                                                {story.title}
                                            </h3>
                                            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                                                {story.description || 'Belum ada deskripsi naskah untuk cerita rakyat ini.'}
                                            </p>
                                        </div>

                                        {/* Meta Stats Bar */}
                                        <div className="pt-2 border-t border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                                                <div className="font-bold text-stone-900">{story.total_scenes}</div>
                                                <div className="text-[10px] text-stone-500">Adegan</div>
                                            </div>
                                            <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                                                <div className="font-bold text-stone-900">{story.total_plays}x</div>
                                                <div className="text-[10px] text-stone-500">Diputar</div>
                                            </div>
                                            <div className="p-1.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-900">
                                                <div className="font-bold">{story.total_dubbings}x</div>
                                                <div className="text-[10px] text-orange-700">Dubbing</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Story Action Footer */}
                                <div className="p-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => openScenesModal(story)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                                    >
                                        <Layers className="w-3.5 h-3.5 text-orange-600" />
                                        <span>Kelola Adegan ({story.scenes?.length || 0})</span>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditStoryModal(story)}
                                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-white hover:border hover:border-stone-200 transition-all cursor-pointer"
                                            title="Edit cerita & ganti cover/ZIP"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteStory(story)}
                                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Hapus cerita"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TAB 2: INTERACTIVITY MATRIX PER SCENE */}
            {activeTab === 'matrix' && (
                <div className="space-y-4">
                    {filteredStories.map((story) => {
                        const isExpanded = expandedStoryScenes[story.id] ?? true;

                        return (
                            <div
                                key={story.id}
                                className="rounded-xl bg-white border border-stone-200 overflow-hidden shadow-2xs"
                            >
                                <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50/50">
                                    <div className="flex items-center gap-3">
                                        {story.cover_url ? (
                                            <img
                                                src={story.cover_url}
                                                alt={story.title}
                                                className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-stone-500 shrink-0">
                                                <Film className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-sm text-stone-900">{story.title}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700">
                                                    {story.category}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                                    {story.fase}
                                                </span>
                                            </div>
                                            <p className="text-xs text-stone-500 mt-0.5">{story.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3 text-xs font-medium text-stone-600">
                                            <span><strong>{story.total_plays}x</strong> Play</span>
                                            <span>•</span>
                                            <span className="text-orange-700"><strong>{story.total_dubbings}x</strong> Dubbing</span>
                                            <span>•</span>
                                            <span><strong>{story.unique_learners}</strong> Siswa</span>
                                        </div>

                                        <button
                                            onClick={() => toggleStoryScenesExpand(story.id)}
                                            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

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
                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                                                                Tokoh: {scene.character_name}
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

                                                    <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono">
                                                        <span>MP4: {scene.video_mute_file || '-'}</span>
                                                        <span>•</span>
                                                        <span>WAV: {scene.audio_original_file || '-'}</span>
                                                    </div>
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL 1: TAMBAH & EDIT CERITA */}
            {storyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in overflow-hidden">
                    <div className="bg-white rounded-2xl border border-stone-200 max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
                        {/* Fixed Header */}
                        <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h3 className="font-bold text-base text-stone-900">
                                    {editingStory ? 'Edit Cerita & Kelola Media' : 'Tambah Cerita Rakyat Baru'}
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Unggah cover gambar (.jpeg, .png) dan paket ZIP naskah animasi
                                </p>
                            </div>
                            <button
                                onClick={() => setStoryModalOpen(false)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form with Scrollable Body & Fixed Footer */}
                        <form onSubmit={handleStorySubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                            {/* Scrollable Body Only */}
                            <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            {/* Judul & Kode Cerita */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2 space-y-1">
                                    <label className="text-xs font-semibold text-stone-700">
                                        Judul Cerita <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={storyForm.data.title}
                                        onChange={(e) => storyForm.setData('title', e.target.value)}
                                        placeholder="Contoh: Hemolapula lo Putito"
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    />
                                    {storyForm.errors.title && (
                                        <p className="text-rose-500 text-[10px]">{storyForm.errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-stone-700">
                                        Kode Cerita <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={storyForm.data.story_code}
                                        onChange={(e) => storyForm.setData('story_code', e.target.value)}
                                        placeholder="story_1"
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Kategori & Fase */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-stone-700">Kategori Cerita</label>
                                    <select
                                        value={storyForm.data.category}
                                        onChange={(e) => storyForm.setData('category', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white cursor-pointer"
                                    >
                                        <option value="Cerita Rakyat Gorontalo">Cerita Rakyat Gorontalo</option>
                                        <option value="Fabel & Cerita Binatang">Fabel & Cerita Binatang</option>
                                        <option value="Legenda Alam & Tempat">Legenda Alam & Tempat</option>
                                        <option value="Lagu & Nada Edukatif">Lagu & Nada Edukatif</option>
                                        <option value="Sejarah & Budi Pekerti">Sejarah & Budi Pekerti</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-stone-700">Fase Kurikulum</label>
                                    <select
                                        value={storyForm.data.fase}
                                        onChange={(e) => storyForm.setData('fase', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white cursor-pointer"
                                    >
                                        <option value="Fase A">Fase A (Kelas 1 - 2 SD)</option>
                                        <option value="Fase B">Fase B (Kelas 3 - 4 SD)</option>
                                        <option value="Fase C">Fase C (Kelas 5 - 6 SD)</option>
                                        <option value="Fase D">Fase D (SMP)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-stone-700">Deskripsi / Sinopsis Cerita</label>
                                <textarea
                                    rows={2}
                                    value={storyForm.data.description}
                                    onChange={(e) => storyForm.setData('description', e.target.value)}
                                    placeholder="Tuliskan ringkasan cerita rakyat Gorontalo ini..."
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                />
                            </div>

                            {/* SECTION: COVER IMAGE MANAGEMENT */}
                            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                                        <span>Manajemen Cover Gambar</span>
                                    </span>
                                    {coverPreviewUrl && (
                                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                                            Cover Terpasang
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                    {/* Preview Box */}
                                    <div className="h-24 rounded-lg bg-white border border-stone-200 flex items-center justify-center overflow-hidden">
                                        {coverPreviewUrl ? (
                                            <img
                                                src={coverPreviewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[11px] text-stone-400">Tidak ada preview</span>
                                        )}
                                    </div>

                                    {/* Upload Input & Selector */}
                                    <div className="sm:col-span-2 space-y-2">
                                        <div>
                                            <label className="text-[11px] text-stone-600 block mb-1">
                                                Unggah File Baru (.jpg, .jpeg, .png, .webp):
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    storyForm.setData('cover_file', file);
                                                    if (file) {
                                                        setCoverPreviewUrl(URL.createObjectURL(file));
                                                    }
                                                }}
                                                className="w-full text-xs text-stone-500 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                                            />
                                        </div>

                                        {availableCovers.length > 0 && (
                                            <div>
                                                <label className="text-[11px] text-stone-600 block mb-1">
                                                    Atau pilih dari cover yang sudah ada di disk:
                                                </label>
                                                <select
                                                    value={storyForm.data.existing_cover}
                                                    onChange={(e) => {
                                                        const selectedName = e.target.value;
                                                        storyForm.setData('existing_cover', selectedName);
                                                        const cov = availableCovers.find(c => c.name === selectedName);
                                                        if (cov) setCoverPreviewUrl(cov.url);
                                                    }}
                                                    className="w-full px-2 py-1 rounded border border-stone-200 text-xs bg-white text-stone-700 cursor-pointer"
                                                >
                                                    <option value="">-- Pilih cover fisik disk --</option>
                                                    {availableCovers.map(c => (
                                                        <option key={c.name} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: PACKAGE ZIP MANAGEMENT */}
                            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                        <FileArchive className="w-3.5 h-3.5 text-orange-600" />
                                        <span>Paket ZIP Naskah & Video Cerita</span>
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[11px] text-stone-600 block mb-1">
                                            Unggah File ZIP Baru (Berisi MP4 Mute & Audio WAV):
                                        </label>
                                        <input
                                            type="file"
                                            accept=".zip"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                storyForm.setData('package_file', file);
                                            }}
                                            className="w-full text-xs text-stone-500 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-800 file:text-white hover:file:bg-stone-900 cursor-pointer"
                                        />
                                    </div>

                                    {availablePackages.length > 0 && (
                                        <div>
                                            <label className="text-[11px] text-stone-600 block mb-1">
                                                Atau hubungkan ke file ZIP yang sudah ada di disk:
                                            </label>
                                            <select
                                                value={storyForm.data.existing_package}
                                                onChange={(e) => storyForm.setData('existing_package', e.target.value)}
                                                className="w-full px-2 py-1 rounded border border-stone-200 text-xs bg-white text-stone-700 cursor-pointer"
                                            >
                                                <option value="">-- Pilih file ZIP di storage/packages --</option>
                                                {availablePackages.map(p => (
                                                    <option key={p.name} value={p.name}>
                                                        {p.name} ({p.formatted_size})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Nama File Backsound */}
                                    <div className="pt-2 border-t border-stone-200/60 space-y-1">
                                        <label className="text-[11px] font-semibold text-stone-700 flex items-center gap-1.5">
                                            <Volume2 className="w-3.5 h-3.5 text-stone-500" />
                                            <span>Nama File Backsound di Dalam ZIP (Opsional):</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={storyForm.data.backsound_file}
                                            onChange={(e) => storyForm.setData('backsound_file', e.target.value)}
                                            placeholder="Contoh: backsound_story_1.mp3"
                                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                                        />
                                        <p className="text-[10px] text-stone-500">
                                            Jika file audio ini disertakan di dalam ZIP, aplikasi Android akan memutarnya secara otomatis (looping) sebagai musik latar belakang.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                            {/* Actions (Fixed / Stay Footer) */}
                            <div className="p-4 px-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end gap-2.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setStoryModalOpen(false)}
                                    className="px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={storyForm.processing}
                                    className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                                >
                                    {storyForm.processing ? 'Menyimpan...' : editingStory ? 'Simpan Perubahan' : 'Buat Cerita'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: KELOLA ADEGAN (SCENES) & NASKAH */}
            {scenesModalOpen && activeStoryForScenes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-hidden">
                    <div className="bg-white rounded-2xl border border-stone-200 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
                        {/* Fixed Header */}
                        <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base text-stone-900">
                                        Kelola Adegan: {activeStoryForScenes.title}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-700">
                                        {activeStoryForScenes.story_code}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Daftar file video MP4 mute, file audio WAV asli, dialog karakter, dan linimasa subtitle
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openCreateSceneModal(activeStoryForScenes)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Adegan</span>
                                </button>

                                <button
                                    onClick={() => setScenesModalOpen(false)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Scenes List (Scrollable Body Only) */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {(activeStoryForScenes.scenes && activeStoryForScenes.scenes.length > 0) ? (
                                activeStoryForScenes.scenes.map((scene) => (
                                    <div
                                        key={scene.id}
                                        className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-stone-300 transition-all space-y-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-md bg-stone-900 text-white text-xs font-bold flex items-center justify-center font-mono">
                                                    {scene.scene_number}
                                                </span>
                                                <h4 className="font-bold text-xs text-stone-900">{scene.title}</h4>
                                                {scene.character_name && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-900">
                                                        Tokoh: {scene.character_name}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditSceneModal(scene)}
                                                    className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                                                    title="Edit naskah & file"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => requestDeleteScene(scene)}
                                                    className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                    title="Hapus adegan ini"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Gorontalo & Translation Dialog Box */}
                                        <div className="p-3 rounded-lg bg-white border border-stone-200 text-xs space-y-1">
                                            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                                                <Volume2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                                <span>"{scene.gorontalo_script || '-'}"</span>
                                            </div>
                                            <div className="text-[11px] text-stone-500 pl-5">
                                                Artinya: "{scene.indonesian_translation || '-'}"
                                            </div>
                                        </div>

                                        {/* Physical Filenames & Dialogues Count */}
                                        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-stone-500 pt-1 border-t border-stone-100">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 text-stone-700">
                                                    <Tv className="w-3 h-3 text-stone-400" />
                                                    <span>{scene.video_mute_file || scene.video_asset || 'video_mute.mp4'}</span>
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 text-stone-700">
                                                    <Volume2 className="w-3 h-3 text-stone-400" />
                                                    <span>{scene.audio_original_file || 'audio.wav'}</span>
                                                </span>
                                            </div>

                                            <span className="text-[10px] text-orange-700 font-sans font-semibold">
                                                {scene.dialogues?.length || 0} Baris Subtitle Dialog
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-stone-400 space-y-2">
                                    <Layers className="w-8 h-8 mx-auto stroke-1" />
                                    <p className="text-xs">Belum ada adegan untuk cerita ini.</p>
                                    <button
                                        onClick={() => openCreateSceneModal(activeStoryForScenes)}
                                        className="text-orange-600 font-semibold text-xs hover:underline cursor-pointer"
                                    >
                                        + Tambah adegan pertama
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-4 px-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between shrink-0">
                            <span className="text-xs text-stone-500">
                                Total: <strong className="text-stone-800 font-semibold">{activeStoryForScenes.scenes?.length || 0} adegan</strong> terdaftar
                            </span>
                            <button
                                onClick={() => setScenesModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: FORM TAMBAH / EDIT ADEGAN (SCENE & DIALOGUE TIMINGS) */}
            {sceneFormModalOpen && activeStoryForScenes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in overflow-hidden">
                    <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
                        {/* Fixed Header */}
                        <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h3 className="font-bold text-base text-stone-900">
                                    {editingScene ? `Edit Scene #${editingScene.scene_number}` : 'Tambah Adegan Baru'}
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    {activeStoryForScenes.title} ({activeStoryForScenes.story_code})
                                </p>
                            </div>
                            <button
                                onClick={() => setSceneFormModalOpen(false)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form with Scrollable Body & Fixed Footer */}
                        <form onSubmit={handleSceneSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                            {/* Scrollable Body */}
                            <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            {/* Nomor & Judul Adegan */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-stone-700">Nomor Scene</label>
                                    <input
                                        type="number"
                                        min={1}
                                        required
                                        value={sceneForm.data.scene_number}
                                        onChange={(e) => sceneForm.setData('scene_number', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-3 space-y-1">
                                    <label className="text-xs font-semibold text-stone-700">
                                        Judul Adegan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={sceneForm.data.title}
                                        onChange={(e) => sceneForm.setData('title', e.target.value)}
                                        placeholder="Contoh: Scene 1: Pertemuan di Pinggir Hutan"
                                        className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Nama Tokoh */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-stone-700">Nama Tokoh Utama Adegan</label>
                                <input
                                    type="text"
                                    value={sceneForm.data.character_name}
                                    onChange={(e) => sceneForm.setData('character_name', e.target.value)}
                                    placeholder="Contoh: Narator / Deka / Putito"
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                />
                            </div>

                            {/* Naskah Gorontalo & Terjemahan */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-stone-700">Naskah Dialog Bahasa Gorontalo</label>
                                <textarea
                                    rows={2}
                                    value={sceneForm.data.gorontalo_script}
                                    onChange={(e) => sceneForm.setData('gorontalo_script', e.target.value)}
                                    placeholder="Contoh: Te Deka to o'ayuwa."
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-stone-700">Terjemahan Bahasa Indonesia</label>
                                <textarea
                                    rows={2}
                                    value={sceneForm.data.indonesian_translation}
                                    onChange={(e) => sceneForm.setData('indonesian_translation', e.target.value)}
                                    placeholder="Contoh: Kancil berada di pinggir hutan lebat."
                                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                />
                            </div>

                            {/* File Fisik Video MP4 & Audio WAV */}
                            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                    <Tv className="w-3.5 h-3.5 text-orange-600" />
                                    <span>Nama File Media di Dalam Paket ZIP</span>
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] text-stone-600 block">File Video Mute (.mp4)</label>
                                        <input
                                            type="text"
                                            value={sceneForm.data.video_mute_file}
                                            onChange={(e) => sceneForm.setData('video_mute_file', e.target.value)}
                                            placeholder="story_1_scene_1_video_mute.mp4"
                                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] text-stone-600 block">File Audio Asli (.wav)</label>
                                        <input
                                            type="text"
                                            value={sceneForm.data.audio_original_file}
                                            onChange={(e) => sceneForm.setData('audio_original_file', e.target.value)}
                                            placeholder="story_1_scene_1_audio.wav"
                                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SUBTITLE & DIALOGUE TIMINGS EDITOR */}
                            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-orange-600" />
                                            <span>Linimasa Subtitle Dialog (Milliseconds)</span>
                                        </span>
                                        <p className="text-[10px] text-stone-500 mt-0.5">
                                            Digunakan player Android untuk sinkronisasi teks saat video diputar
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addDialogueRow}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-900 text-white text-[11px] font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3" /> Tambah Baris
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {(sceneForm.data.dialogues && sceneForm.data.dialogues.length > 0) ? (
                                        sceneForm.data.dialogues.map((dlg, idx) => (
                                            <div
                                                key={dlg.id || idx}
                                                className="p-2.5 rounded-lg bg-white border border-stone-200 flex flex-col sm:flex-row sm:items-center gap-2 text-xs"
                                            >
                                                <div className="flex items-center gap-1 shrink-0 font-mono text-[11px]">
                                                    <input
                                                        type="number"
                                                        value={dlg.startTimeMs}
                                                        onChange={(e) => updateDialogueRow(idx, 'startTimeMs', parseInt(e.target.value) || 0)}
                                                        placeholder="Mulai (ms)"
                                                        className="w-20 px-1.5 py-1 rounded border border-stone-200"
                                                        title="Waktu mulai (ms)"
                                                    />
                                                    <span className="text-stone-400">-</span>
                                                    <input
                                                        type="number"
                                                        value={dlg.endTimeMs}
                                                        onChange={(e) => updateDialogueRow(idx, 'endTimeMs', parseInt(e.target.value) || 0)}
                                                        placeholder="Selesai (ms)"
                                                        className="w-20 px-1.5 py-1 rounded border border-stone-200"
                                                        title="Waktu selesai (ms)"
                                                    />
                                                </div>

                                                <input
                                                    type="text"
                                                    value={dlg.character}
                                                    onChange={(e) => updateDialogueRow(idx, 'character', e.target.value)}
                                                    placeholder="Tokoh"
                                                    className="w-28 px-2 py-1 rounded border border-stone-200 shrink-0 text-xs"
                                                />

                                                <input
                                                    type="text"
                                                    value={dlg.text}
                                                    onChange={(e) => updateDialogueRow(idx, 'text', e.target.value)}
                                                    placeholder="Teks dialog yang diucapkan..."
                                                    className="flex-1 px-2 py-1 rounded border border-stone-200 text-xs"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => removeDialogueRow(idx)}
                                                    className="p-1 rounded text-stone-400 hover:text-rose-600 cursor-pointer shrink-0"
                                                    title="Hapus baris"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-stone-400 text-xs">
                                            Belum ada baris subtitle dialog. Klik "Tambah Baris" di atas.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                            {/* Submit Scene (Fixed Footer) */}
                            <div className="p-4 px-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end gap-2.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setSceneFormModalOpen(false)}
                                    className="px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={sceneForm.processing}
                                    className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                                >
                                    {sceneForm.processing ? 'Menyimpan...' : editingScene ? 'Perbarui Adegan' : 'Simpan Adegan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: IMPORT CERITA DARI JSON */}
            {importJsonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in overflow-hidden">
                    <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
                        {/* Fixed Header */}
                        <div className="p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                    <FileJson className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-stone-900">
                                        Import Cerita & Adegan dari JSON
                                    </h3>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        Mendukung output JSON terpadu dari pipeline produksi cerita dan audio
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setImportJsonModalOpen(false)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form with Scrollable Body & Fixed Footer */}
                        <form onSubmit={handleImportJsonSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                            {/* Scrollable Body Only */}
                            <div className="p-5 overflow-y-auto flex-1 space-y-4">
                                {/* Tab Selector: Tempel Teks vs Upload File */}
                                <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-3">
                                    <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setImportMethod('paste')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                                importMethod === 'paste'
                                                    ? 'bg-white text-stone-900 shadow-2xs'
                                                    : 'text-stone-600 hover:text-stone-900'
                                            }`}
                                        >
                                            Tempel Teks JSON
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImportMethod('upload')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                                importMethod === 'upload'
                                                    ? 'bg-white text-stone-900 shadow-2xs'
                                                    : 'text-stone-600 hover:text-stone-900'
                                            }`}
                                        >
                                            Unggah File (.json)
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={handleUseSample}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer border border-indigo-200/60"
                                            title="Isi textarea dengan contoh struktur JSON cerita"
                                        >
                                            <Sparkles className="w-3 h-3 text-indigo-500" />
                                            <span>Contoh JSON</span>
                                        </button>
                                    </div>
                                </div>

                                {importMethod === 'paste' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                                                <span>Data JSON Cerita & Adegan</span>
                                                <span className="text-rose-500">*</span>
                                            </label>
                                            {importJsonForm.data.json_text.trim() && (
                                                <button
                                                    type="button"
                                                    onClick={handleFormatJson}
                                                    className="text-[11px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
                                                >
                                                    Rapikan Format
                                                </button>
                                            )}
                                        </div>

                                        <textarea
                                            rows={11}
                                            value={importJsonForm.data.json_text}
                                            onChange={(e) => importJsonForm.setData('json_text', e.target.value)}
                                            placeholder={`Paste data JSON di sini. Format yang didukung:\n[\n  {\n    "storyId": "story_1",\n    "title": "Hemolapula lo Putito",\n    "fase": "Fase A",\n    "coverImage": "cover_hemolapula_lo_putito",\n    "scenes": [ ... ]\n  }\n]`}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-stone-50/50 leading-relaxed"
                                        />

                                        {/* Real-time JSON validation feedback */}
                                        {jsonParsedStatus && (
                                            <div>
                                                {jsonParsedStatus.valid ? (
                                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                                                        <div className="flex items-center gap-1.5 font-semibold">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                            <span>
                                                                Format JSON Valid! Terdeteksi {jsonParsedStatus.totalStories} cerita ({jsonParsedStatus.totalScenes} adegan).
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-emerald-700 pl-5">
                                                            Cerita: {jsonParsedStatus.titles.join(', ')}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                                        <div>
                                                            <span className="font-semibold">Format JSON belum valid: </span>
                                                            <span className="font-mono text-[11px]">{jsonParsedStatus.error}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-stone-700 block">
                                            Pilih File JSON (.json atau .txt)
                                        </label>
                                        <div className="p-6 border-2 border-dashed border-stone-200 rounded-xl hover:border-indigo-400 bg-stone-50/40 hover:bg-indigo-50/20 transition-all text-center space-y-2 cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept=".json,.txt"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    importJsonForm.setData('json_file', file);
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-stone-800">
                                                    {importJsonForm.data.json_file ? importJsonForm.data.json_file.name : 'Klik untuk memilih file JSON atau seret ke sini'}
                                                </span>
                                                <p className="text-[11px] text-stone-400 mt-0.5">
                                                    Ukuran maksimal 50 MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Informational Callout: How Auto-linking Works */}
                                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                                    <div className="flex items-center gap-2 font-bold text-stone-800">
                                        <Info className="w-4 h-4 text-stone-500 shrink-0" />
                                        <span>Fitur Penautan Otomatis (Auto-Linking)</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px] leading-relaxed">
                                        <li>
                                            <strong>Cover Gambar:</strong> Otomatis mencocokkan nilai <code className="bg-stone-200 px-1 rounded">coverImage</code> dengan file fisik di <code className="bg-stone-200 px-1 rounded">storage/covers</code> (bisa tanpa ekstensi seperti <code className="bg-stone-200 px-1 rounded">cover_hemolapula_lo_putito</code>).
                                        </li>
                                        <li>
                                            <strong>Paket ZIP Offline:</strong> Otomatis menautkan file <code className="bg-stone-200 px-1 rounded">&#123;storyId&#125;.zip</code> di <code className="bg-stone-200 px-1 rounded">storage/packages</code> jika tersedia dan menghitung ukuran byte-nya.
                                        </li>
                                        <li>
                                            <strong>Adegan & Linimasa:</strong> Seluruh adegan, tokoh dialog, file MP4/WAV, dan linimasa subtitle milidetik akan langsung tersimpan lengkap ke database.
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Actions (Fixed / Stay Footer) */}
                            <div className="p-4 px-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between shrink-0">
                                <div className="text-[11px] text-stone-500">
                                    {importMethod === 'paste' && jsonParsedStatus?.valid && (
                                        <span className="text-emerald-700 font-medium">
                                            Siap mengimpor {jsonParsedStatus.totalStories} cerita
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setImportJsonModalOpen(false)}
                                        className="px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            importJsonForm.processing ||
                                            (importMethod === 'paste' && (!importJsonForm.data.json_text.trim() || jsonParsedStatus?.valid === false)) ||
                                            (importMethod === 'upload' && !importJsonForm.data.json_file)
                                        }
                                        className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                        <FileJson className="w-3.5 h-3.5" />
                                        <span>{importJsonForm.processing ? 'Memproses Import...' : 'Proses Import JSON'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: KONFIRMASI HAPUS ADEGAN (CREATIVE MODAL) */}
            {sceneToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-hidden">
                    <div className="bg-white rounded-2xl border border-rose-200/80 max-w-md w-full shadow-2xl overflow-hidden flex flex-col my-auto border-t-4 border-t-rose-500">
                        {/* Header */}
                        <div className="p-5 pb-4 border-b border-stone-100 flex items-start gap-3.5 bg-gradient-to-b from-rose-50/60 to-white shrink-0">
                            <div className="w-11 h-11 rounded-xl bg-rose-100/90 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                                <Trash2 className="w-5 h-5 text-rose-600 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                                        {sceneToDelete.storyCode}
                                    </span>
                                    <span className="text-xs text-stone-500 truncate max-w-[200px]" title={sceneToDelete.storyTitle}>
                                        {sceneToDelete.storyTitle}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-stone-900 mt-1">
                                    Hapus Adegan Cerita?
                                </h3>
                            </div>
                            <button
                                onClick={() => !isDeletingScene && setSceneToDelete(null)}
                                disabled={isDeletingScene}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-3.5 overflow-y-auto max-h-[65vh] flex-1">
                            {/* Scene Details Card */}
                            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-md bg-stone-900 text-white text-xs font-bold flex items-center justify-center font-mono">
                                            {sceneToDelete.scene.scene_number}
                                        </span>
                                        <h4 className="font-bold text-xs text-stone-900">
                                            {sceneToDelete.scene.title}
                                        </h4>
                                    </div>
                                    {sceneToDelete.scene.character_name && (
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-900">
                                            Tokoh: {sceneToDelete.scene.character_name}
                                        </span>
                                    )}
                                </div>

                                {sceneToDelete.scene.gorontalo_script && (
                                    <div className="p-2.5 rounded-lg bg-white border border-stone-200/70 text-xs italic text-stone-700 leading-relaxed">
                                        "{sceneToDelete.scene.gorontalo_script}"
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-200/50">
                                    {sceneToDelete.scene.video_mute_file && (
                                        <span className="px-2 py-0.5 rounded bg-white border border-stone-200 flex items-center gap-1">
                                            <Tv className="w-3 h-3 text-stone-400" />
                                            <span className="truncate max-w-[130px]">{sceneToDelete.scene.video_mute_file}</span>
                                        </span>
                                    )}
                                    {sceneToDelete.scene.audio_original_file && (
                                        <span className="px-2 py-0.5 rounded bg-white border border-stone-200 flex items-center gap-1">
                                            <Volume2 className="w-3 h-3 text-stone-400" />
                                            <span className="truncate max-w-[130px]">{sceneToDelete.scene.audio_original_file}</span>
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200/60 flex items-center gap-1 font-semibold ml-auto font-sans text-[10px]">
                                        <Clock className="w-3 h-3" />
                                        <span>{(sceneToDelete.scene.dialogues || []).length} dialog</span>
                                    </span>
                                </div>
                            </div>

                            {/* Alert Warning */}
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5">
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] leading-relaxed">
                                    Adegan ini beserta rekaman linimasa subtitle dialognya akan dihapus secara permanen dari database. File fisik MP4/WAV di disk storage tidak akan dihapus.
                                </p>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-4 px-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end gap-2.5 shrink-0">
                            <button
                                type="button"
                                disabled={isDeletingScene}
                                onClick={() => setSceneToDelete(null)}
                                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingScene}
                                onClick={confirmDeleteScene}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                            >
                                {isDeletingScene ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Ya, Hapus Adegan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 6: KONFIRMASI HAPUS CERITA (CREATIVE MODAL) */}
            {storyToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-hidden">
                    <div className="bg-white rounded-2xl border border-rose-200/80 max-w-md w-full shadow-2xl overflow-hidden flex flex-col my-auto border-t-4 border-t-rose-500">
                        {/* Header */}
                        <div className="p-5 pb-4 border-b border-stone-100 flex items-start gap-3.5 bg-gradient-to-b from-rose-50/60 to-white shrink-0">
                            <div className="w-11 h-11 rounded-xl bg-rose-100/90 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                                <Trash2 className="w-5 h-5 text-rose-600 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                                    {storyToDelete.story_code}
                                </span>
                                <h3 className="text-base font-bold text-stone-900 mt-1">
                                    Hapus Cerita Rakyat?
                                </h3>
                            </div>
                            <button
                                onClick={() => !isDeletingStory && setStoryToDelete(null)}
                                disabled={isDeletingStory}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-3.5 overflow-y-auto max-h-[65vh] flex-1">
                            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                                <h4 className="font-bold text-sm text-stone-900">
                                    {storyToDelete.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
                                    <span className="px-2 py-0.5 rounded bg-white border border-stone-200">
                                        Kategori: {storyToDelete.category}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-medium">
                                        {storyToDelete.fase}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-semibold">
                                        {storyToDelete.scenes?.length || storyToDelete.total_scenes || 0} Adegan
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5">
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] leading-relaxed">
                                    Menghapus cerita ini akan menghapus seluruh data adegan, linimasa subtitle, dan catatan interaktivitas terkait dari database. Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-4 px-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end gap-2.5 shrink-0">
                            <button
                                type="button"
                                disabled={isDeletingStory}
                                onClick={() => setStoryToDelete(null)}
                                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingStory}
                                onClick={confirmDeleteStory}
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                            >
                                {isDeletingStory ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menghapus...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Ya, Hapus Cerita</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 7: KONFIRMASI SINKRONISASI STORAGE */}
            {syncModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-hidden">
                    <div className="bg-white rounded-2xl border border-emerald-200/80 max-w-md w-full shadow-2xl overflow-hidden flex flex-col my-auto border-t-4 border-t-emerald-500">
                        {/* Header */}
                        <div className="p-5 pb-4 border-b border-stone-100 flex items-start gap-3.5 bg-gradient-to-b from-emerald-50/60 to-white shrink-0">
                            <div className="w-11 h-11 rounded-xl bg-emerald-100/90 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
                                <FolderSync className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-stone-900 mt-1">
                                    Sinkronkan Aset Storage?
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Pencocokan file fisik cover dan paket ZIP
                                </p>
                            </div>
                            <button
                                onClick={() => setSyncModalOpen(false)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-3 overflow-y-auto max-h-[65vh] flex-1 text-xs text-stone-600">
                            <p className="leading-relaxed">
                                Sistem akan memindai folder <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono">storage/app/public/</code> untuk mendeteksi 6 file cover gambar dan paket ZIP naskah, lalu menyelaraskan data adegan, video MP4 mute, dan audio WAV asli ke database cerita.
                            </p>
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Aman dijalankan kapan saja tanpa menghapus riwayat analitik.</span>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-4 px-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-end gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setSyncModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmSyncStorage}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                                <FolderSync className="w-3.5 h-3.5" />
                                <span>Mulai Sinkronisasi</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
