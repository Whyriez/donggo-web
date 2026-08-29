import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Code2,
    Copy,
    Check,
    Send,
    Terminal,
    Key,
    ShieldCheck,
    BookOpen,
    Layers,
    Smartphone,
    RefreshCw,
    Database,
    FileText,
    CheckCircle2,
    AlertCircle,
    Cpu,
    ExternalLink
} from 'lucide-react';

interface ApiDocsProps {
    baseUrl: string;
    apiKey: string;
    sampleUser: any;
    stories: any[];
}

export default function ApiDocs({ baseUrl, apiKey, sampleUser, stories }: ApiDocsProps) {
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'endpoints' | 'models' | 'retrofit' | 'repository' | 'sandbox'>('endpoints');
    const [selectedEndpoint, setSelectedEndpoint] = useState<'user' | 'video-play' | 'voice-replace' | 'sync-batch' | 'summary'>('user');
    const [customApiKey, setCustomApiKey] = useState<string>(apiKey || 'donggo_secret_key_2026_xyz');

    const cleanBaseUrl = baseUrl.replace('/monitoring', '');

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSnippet(id);
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    // 1. Endpoint Definitions & Schemas
    const endpoints = {
        user: {
            method: 'POST',
            path: '/api/v1/user',
            title: '1. Registrasi / Update Profil Siswa (User Monitoring)',
            desc: 'Digunakan saat siswa pertama kali memasukkan data profil di aplikasi Android atau saat profil diperbarui. Jika device_id sudah terdaftar, data akan otomatis di-update (upsert).',
            headers: [
                { name: 'X-API-KEY', type: 'String', required: true, desc: 'API security key' },
                { name: 'Content-Type', type: 'String', required: true, desc: 'application/json' },
                { name: 'Accept', type: 'String', required: true, desc: 'application/json' },
            ],
            params: [
                { name: 'name', type: 'String', required: true, desc: 'Nama lengkap / nama panggilan siswa', example: '"Fahri Pratama"' },
                { name: 'age', type: 'String', required: false, desc: 'Usia siswa (angka atau teks)', example: '"10"' },
                { name: 'gender', type: 'String', required: false, desc: 'Jenis kelamin ("Laki-laki" / "Perempuan")', example: '"Laki-laki"' },
                { name: 'educationLevel', type: 'String', required: false, desc: 'Jenjang pendidikan ("SD", "SMP", "TK", dll)', example: '"SD"' },
                { name: 'educationClass', type: 'String', required: false, desc: 'Kelas sekolah', example: '"Kelas 4"' },
                { name: 'gorontaloFrequency', type: 'String', required: false, desc: 'Frekuensi bahasa daerah ("Sering", "Kadang-kadang", "Jarang", "Tidak Pernah")', example: '"Jarang"' },
                { name: 'appGoal', type: 'String', required: false, desc: 'Tujuan belajar menggunakan aplikasi', example: '"Belajar cerita rakyat & dubbing bahasa Gorontalo"' },
                { name: 'agePhase', type: 'String', required: false, desc: 'Kategori fase usia ("Anak-anak (7-12 tahun)", "Remaja")', example: '"Anak-anak (7-12 tahun)"' },
                { name: 'deviceId', type: 'String', required: false, desc: 'Unique Android Device ID / UUID (penting untuk tracking tanpa akun)', example: '"donggo-android-uuid-98765"' },
            ],
            sampleRequest: {
                name: 'Fahri Pratama',
                age: '10',
                gender: 'Laki-laki',
                educationLevel: 'SD',
                educationClass: 'Kelas 4',
                gorontaloFrequency: 'Jarang',
                appGoal: 'Belajar kosakata cerita rakyat Gorontalo',
                agePhase: 'Anak-anak (7-12 tahun)',
                deviceId: 'donggo-android-uuid-98765'
            },
            sampleResponse: {
                status: 'success',
                message: 'User monitoring data saved successfully',
                data: {
                    id: 1,
                    user_id: 1,
                    device_id: 'donggo-android-uuid-98765',
                    name: 'Fahri Pratama',
                    created_at: '2026-08-27T10:30:00.000000Z'
                }
            }
        },
        'video-play': {
            method: 'POST',
            path: '/api/v1/video-play',
            title: '2. Log Pemutaran Video Animasi',
            desc: 'Dikirim setiap kali siswa memutar video cerita atau menyelesaikan pemutaran adegan/scene animasi.',
            headers: [
                { name: 'X-API-KEY', type: 'String', required: true, desc: 'API security key' },
                { name: 'Content-Type', type: 'String', required: true, desc: 'application/json' },
            ],
            params: [
                { name: 'story_title', type: 'String', required: true, desc: 'Judul cerita rakyat', example: '"Legenda Lahilote (Batu Pohe)"' },
                { name: 'scene_title', type: 'String', required: true, desc: 'Judul scene adegan', example: '"Scene 1: Pertemuan di Mata Air Hulu Sungai"' },
                { name: 'user_id', type: 'Integer', required: false, desc: 'ID siswa yang didapat saat registerUser (opsional jika device_id dikirim)', example: '1' },
                { name: 'device_id', type: 'String', required: false, desc: 'Device UUID siswa (otomatis ditautkan jika user_id kosong)', example: '"donggo-android-uuid-98765"' },
                { name: 'video_name', type: 'String', required: false, desc: 'Nama file aset video', example: '"lahilote_scene_1.mp4"' },
                { name: 'duration_seconds', type: 'Integer', required: false, desc: 'Lama durasi video diputar dalam detik', example: '45' },
                { name: 'is_completed', type: 'Boolean', required: false, desc: 'Apakah video ditonton sampai selesai', example: 'true' },
                { name: 'played_at', type: 'String (ISO/Date)', required: false, desc: 'Waktu kejadian (default waktu server sekarang)', example: '"2026-08-27 18:30:00"' }
            ],
            sampleRequest: {
                device_id: 'donggo-android-uuid-98765',
                story_title: 'Legenda Lahilote (Batu Pohe)',
                scene_title: 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
                video_name: 'lahilote_scene_1.mp4',
                duration_seconds: 45,
                is_completed: true
            },
            sampleResponse: {
                status: 'success',
                message: 'Video play logged successfully',
                data: {
                    log_id: 82,
                    story_title: 'Legenda Lahilote (Batu Pohe)',
                    scene_title: 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
                    played_at: '2026-08-27T10:30:15.000000Z'
                }
            }
        },
        'voice-replace': {
            method: 'POST',
            path: '/api/v1/voice-replace',
            title: '3. Log Interaktivitas Ganti Suara / Dubbing',
            desc: 'Dikirim saat siswa merekam suara sendiri dan menggantikan audio suara karakter di dalam scene cerita.',
            headers: [
                { name: 'X-API-KEY', type: 'String', required: true, desc: 'API security key' },
                { name: 'Content-Type', type: 'String', required: true, desc: 'application/json' },
            ],
            params: [
                { name: 'story_title', type: 'String', required: true, desc: 'Judul cerita rakyat', example: '"Legenda Lahilote (Batu Pohe)"' },
                { name: 'scene_title', type: 'String', required: true, desc: 'Judul scene dubbing', example: '"Scene 1: Pertemuan di Mata Air Hulu Sungai"' },
                { name: 'user_id', type: 'Integer', required: false, desc: 'ID siswa (opsional)', example: '1' },
                { name: 'device_id', type: 'String', required: false, desc: 'Device UUID siswa', example: '"donggo-android-uuid-98765"' },
                { name: 'action_type', type: 'String', required: false, desc: 'Jenis aksi ("replaced", "recorded", "previewed")', example: '"replaced"' },
                { name: 'replacement_count', type: 'Integer', required: false, desc: 'Jumlah kali dubbing dilakukan (default: 1)', example: '1' },
                { name: 'audio_duration_seconds', type: 'Float / Double', required: false, desc: 'Panjang rekaman audio siswa dalam detik', example: '12.4' },
                { name: 'recorded_at', type: 'String (ISO/Date)', required: false, desc: 'Waktu rekaman dibuat', example: '"2026-08-27 18:30:00"' }
            ],
            sampleRequest: {
                device_id: 'donggo-android-uuid-98765',
                story_title: 'Legenda Lahilote (Batu Pohe)',
                scene_title: 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
                action_type: 'replaced',
                replacement_count: 1,
                audio_duration_seconds: 12.4
            },
            sampleResponse: {
                status: 'success',
                message: 'Voice replacement logged successfully',
                data: {
                    log_id: 50,
                    story_title: 'Legenda Lahilote (Batu Pohe)',
                    scene_title: 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
                    replacement_count: 1,
                    recorded_at: '2026-08-27T10:30:30.000000Z'
                }
            }
        },
        'sync-batch': {
            method: 'POST',
            path: '/api/v1/sync-batch',
            title: '4. Sinkronisasi Batch (Offline-to-Online Sync)',
            desc: 'Fitur andalan Android saat offline. Mengirim seluruh profil user, tumpukan play logs, dan voice logs dalam satu payload transaksi saat internet tersambung kembali.',
            headers: [
                { name: 'X-API-KEY', type: 'String', required: true, desc: 'API security key' },
                { name: 'Content-Type', type: 'String', required: true, desc: 'application/json' },
            ],
            params: [
                { name: 'user', type: 'Object (UserMonitoringData)', required: false, desc: 'Data profil siswa', example: '{ ... }' },
                { name: 'video_plays', type: 'Array<VideoPlayLog>', required: false, desc: 'Daftar log pemutaran video yang terkumpul saat offline', example: '[ { ... }, { ... } ]' },
                { name: 'voice_replacements', type: 'Array<VoiceReplacementLog>', required: false, desc: 'Daftar log dubbing yang terkumpul saat offline', example: '[ { ... }, { ... } ]' }
            ],
            sampleRequest: {
                user: {
                    name: 'Dimas Prasetyo',
                    age: '9',
                    gender: 'Laki-laki',
                    educationLevel: 'SD',
                    educationClass: 'Kelas 3',
                    gorontaloFrequency: 'Jarang',
                    appGoal: 'Latihan berbicara bahasa Gorontalo lewat video',
                    agePhase: 'Anak-anak (7-12 tahun)',
                    deviceId: 'donggo-android-uuid-11223'
                },
                video_plays: [
                    {
                        story_title: 'Asal Usul Danau Limboto (Bulalo Limboto)',
                        scene_title: 'Scene 1: Mata Air Suci di Lembah Hijau',
                        video_name: 'limboto_scene_1.mp4',
                        duration_seconds: 40,
                        is_completed: true,
                        played_at: '2026-08-27 14:10:00'
                    },
                    {
                        story_title: 'Legenda Lahilote (Batu Pohe)',
                        scene_title: 'Scene 1: Pertemuan di Mata Air Hulu Sungai',
                        video_name: 'lahilote_scene_1.mp4',
                        duration_seconds: 45,
                        is_completed: true,
                        played_at: '2026-08-27 15:30:00'
                    }
                ],
                voice_replacements: [
                    {
                        story_title: 'Asal Usul Danau Limboto (Bulalo Limboto)',
                        scene_title: 'Scene 1: Mata Air Suci di Lembah Hijau',
                        action_type: 'replaced',
                        replacement_count: 2,
                        audio_duration_seconds: 10.4,
                        recorded_at: '2026-08-27 14:15:00'
                    }
                ]
            },
            sampleResponse: {
                status: 'success',
                message: 'Batch monitoring data synced successfully',
                data: {
                    user_id: 5,
                    synced_video_plays: 2,
                    synced_voice_replacements: 1,
                    synced_at: '2026-08-27T10:31:00.000000Z'
                }
            }
        },
        summary: {
            method: 'GET',
            path: '/api/v1/summary',
            title: '5. Server Health & Status Summary',
            desc: 'Mengecek ketersediaan server backend dan ringkasan total telemetri.',
            headers: [
                { name: 'X-API-KEY', type: 'String', required: true, desc: 'API security key' },
            ],
            params: [],
            sampleRequest: {},
            sampleResponse: {
                status: 'online',
                app_name: 'Donggo Animation & Voice Dubbing Monitoring API',
                version: '1.0.0',
                counts: {
                    users: 7,
                    video_plays: 81,
                    voice_replacements: 49
                },
                server_time: '2026-08-27T10:31:30.000000Z'
            }
        }
    };

    // 2. Kotlin Data Models Snippet
    const kotlinModelsSnippet = `package com.donggo.app.data.model

import com.google.gson.annotations.SerializedName

// 1. Generic API Response Wrapper
data class ApiResponse<T>(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: T? = null
)

// 2. Profil Siswa / Demografi (UserMonitoringData)
data class UserMonitoringData(
    @SerializedName("name") val name: String,
    @SerializedName("age") val age: String? = null,
    @SerializedName("gender") val gender: String? = null,
    @SerializedName("educationLevel") val educationLevel: String? = null,
    @SerializedName("educationClass") val educationClass: String? = null,
    @SerializedName("gorontaloFrequency") val gorontaloFrequency: String? = null,
    @SerializedName("appGoal") val appGoal: String? = null,
    @SerializedName("agePhase") val agePhase: String? = null,
    @SerializedName("deviceId") val deviceId: String? = null
)

data class UserResponse(
    @SerializedName("id") val id: Int,
    @SerializedName("user_id") val userId: Int,
    @SerializedName("device_id") val deviceId: String?,
    @SerializedName("name") val name: String
)

// 3. Request Log Pemutaran Video
data class VideoPlayLogRequest(
    @SerializedName("story_title") val storyTitle: String,
    @SerializedName("scene_title") val sceneTitle: String,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("device_id") val deviceId: String? = null,
    @SerializedName("video_name") val videoName: String? = null,
    @SerializedName("duration_seconds") val durationSeconds: Int = 0,
    @SerializedName("is_completed") val isCompleted: Boolean = false,
    @SerializedName("played_at") val playedAt: String? = null
)

// 4. Request Log Dubbing / Penggantian Suara
data class VoiceReplacementLogRequest(
    @SerializedName("story_title") val storyTitle: String,
    @SerializedName("scene_title") val sceneTitle: String,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("device_id") val deviceId: String? = null,
    @SerializedName("action_type") val actionType: String = "replaced", // "replaced", "recorded"
    @SerializedName("replacement_count") val replacementCount: Int = 1,
    @SerializedName("audio_duration_seconds") val audioDurationSeconds: Double? = null,
    @SerializedName("recorded_at") val recordedAt: String? = null
)

// 5. Request Batch Offline-to-Online Sync
data class BatchSyncRequest(
    @SerializedName("user") val user: UserMonitoringData? = null,
    @SerializedName("video_plays") val videoPlays: List<VideoPlayLogRequest> = emptyList(),
    @SerializedName("voice_replacements") val voiceReplacements: List<VoiceReplacementLogRequest> = emptyList()
)

data class BatchSyncResponse(
    @SerializedName("user_id") val userId: Int?,
    @SerializedName("synced_video_plays") val syncedVideoPlays: Int,
    @SerializedName("synced_voice_replacements") val syncedVoiceReplacements: Int,
    @SerializedName("synced_at") val syncedAt: String
)`;

    // 3. Retrofit Setup Snippet
    const retrofitSnippet = `package com.donggo.app.data.network

import com.donggo.app.data.model.*
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

// 1. Interface Definisi Endpoint REST API
interface DonggoApiService {
    // Registrasi Profil Siswa
    @POST("api/v1/user")
    suspend fun registerUser(
        @Body data: UserMonitoringData
    ): Response<ApiResponse<UserResponse>>

    // Kirim Log Pemutaran Video
    @POST("api/v1/video-play")
    suspend fun logVideoPlay(
        @Body data: VideoPlayLogRequest
    ): Response<ApiResponse<Map<String, Any>>>

    // Kirim Log Dubbing Suara
    @POST("api/v1/voice-replace")
    suspend fun logVoiceReplacement(
        @Body data: VoiceReplacementLogRequest
    ): Response<ApiResponse<Map<String, Any>>>

    // Sinkronisasi Batch Offline
    @POST("api/v1/sync-batch")
    suspend fun syncBatch(
        @Body data: BatchSyncRequest
    ): Response<ApiResponse<BatchSyncResponse>>
}

// 2. Singleton Network Client
object ApiClient {
    private const val BASE_URL = "${cleanBaseUrl}/"
    private const val API_KEY = "${customApiKey}"

    private val authInterceptor = Interceptor { chain ->
        val request = chain.request().newBuilder()
            .addHeader("X-API-KEY", API_KEY)
            .addHeader("Accept", "application/json")
            .addHeader("Content-Type", "application/json")
            .build()
        chain.proceed(request)
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    val apiService: DonggoApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(DonggoApiService::class.java)
    }
}`;

    // 4. Android Repository / Helper Implementation Snippet
    const repositorySnippet = `package com.donggo.app.data.repository

import android.content.Context
import android.provider.Settings
import com.donggo.app.data.model.*
import com.donggo.app.data.network.ApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class DonggoMonitoringRepository(private val context: Context) {

    private val api = ApiClient.apiService

    // Dapatkan Android Device ID unik
    fun getDeviceId(): String {
        return Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ANDROID_ID
        ) ?: "unknown_device"
    }

    /**
     * 1. Simpan / Perbarui Profil Siswa
     */
    suspend fun saveUserProfile(
        name: String,
        age: String,
        gender: String,
        educationLevel: String,
        educationClass: String,
        gorontaloFrequency: String,
        appGoal: String
    ): Result<UserResponse> = withContext(Dispatchers.IO) {
        try {
            val userPayload = UserMonitoringData(
                name = name,
                age = age,
                gender = gender,
                educationLevel = educationLevel,
                educationClass = educationClass,
                gorontaloFrequency = gorontaloFrequency,
                appGoal = appGoal,
                agePhase = if ((age.toIntOrNull() ?: 10) <= 12) "Anak-anak (7-12 tahun)" else "Remaja",
                deviceId = getDeviceId()
            )
            val response = api.registerUser(userPayload)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception(response.message() ?: "Gagal menyimpan profil"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * 2. Catat Event Setiap Siswa Memutar Video Scene
     */
    suspend fun trackVideoPlay(
        storyTitle: String,
        sceneTitle: String,
        videoName: String,
        durationSeconds: Int,
        isCompleted: Boolean
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val payload = VideoPlayLogRequest(
                storyTitle = storyTitle,
                sceneTitle = sceneTitle,
                videoName = videoName,
                durationSeconds = durationSeconds,
                isCompleted = isCompleted,
                deviceId = getDeviceId()
            )
            val response = api.logVideoPlay(payload)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("HTTP \${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * 3. Catat Event Setiap Siswa Melakukan Dubbing Suara
     */
    suspend fun trackVoiceDubbing(
        storyTitle: String,
        sceneTitle: String,
        audioDurationSeconds: Double
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val payload = VoiceReplacementLogRequest(
                storyTitle = storyTitle,
                sceneTitle = sceneTitle,
                actionType = "replaced",
                replacementCount = 1,
                audioDurationSeconds = audioDurationSeconds,
                deviceId = getDeviceId()
            )
            val response = api.logVoiceReplacement(payload)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("HTTP \${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * 4. Sinkronisasi Data Offline (Batch Sync)
     */
    suspend fun syncOfflineData(
        offlinePlays: List<VideoPlayLogRequest>,
        offlineVoices: List<VoiceReplacementLogRequest>,
        userProfile: UserMonitoringData? = null
    ): Result<BatchSyncResponse> = withContext(Dispatchers.IO) {
        try {
            val batchPayload = BatchSyncRequest(
                user = userProfile,
                videoPlays = offlinePlays,
                voiceReplacements = offlineVoices
            )
            val response = api.syncBatch(batchPayload)
            if (response.isSuccessful && response.body()?.data != null) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception("Sync failed: \${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`;

    // Sandbox Interactive Request Execution
    const [requestPayload, setRequestPayload] = useState<string>(
        JSON.stringify(endpoints.user.sampleRequest, null, 2)
    );
    const [responseStatus, setResponseStatus] = useState<number | null>(null);
    const [responseData, setResponseData] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSelectEndpoint = (key: keyof typeof endpoints) => {
        setSelectedEndpoint(key);
        setRequestPayload(JSON.stringify(endpoints[key].sampleRequest, null, 2));
        setResponseData(null);
        setResponseStatus(null);
    };

    const handleExecuteRequest = async () => {
        setIsLoading(true);
        setResponseData(null);
        setResponseStatus(null);

        const ep = endpoints[selectedEndpoint];
        const targetUrl = `${cleanBaseUrl}${ep.path.replace('/api/v1', '/api/v1')}`;

        try {
            const options: RequestInit = {
                method: ep.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-KEY': customApiKey,
                }
            };

            if (ep.method !== 'GET') {
                options.body = requestPayload;
            }

            const res = await fetch(targetUrl, options);
            setResponseStatus(res.status);
            const data = await res.json();
            setResponseData(JSON.stringify(data, null, 2));
        } catch (err: any) {
            setResponseStatus(500);
            setResponseData(JSON.stringify({ error: err.message || 'Gagal mengirim request' }, null, 2));
        } finally {
            setIsLoading(false);
        }
    };

    const currentEp = endpoints[selectedEndpoint];

    return (
        <AdminLayout
            title="Dokumentasi & Integrasi REST API Android"
            subtitle="Panduan komprehensif pengiriman data telemetri, model Kotlin, autentikasi X-API-KEY, dan interactive testing console"
        >
            <Head title="Dokumentasi API Android - Donggo" />

            <div className="space-y-6">
                {/* 1. API Security Header Banner */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                            <Key className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-bold text-stone-900 flex items-center gap-2">
                                <span>Security Header:</span>
                                <span className="font-mono text-[11px] bg-amber-200/70 text-amber-950 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                    X-API-KEY
                                </span>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-0.5">
                                Seluruh request dari Android wajib menyertakan header ini. Base URL: <strong className="font-mono text-stone-900">{cleanBaseUrl}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={customApiKey}
                            onChange={(e) => setCustomApiKey(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-mono text-xs text-stone-900 w-64 shadow-2xs outline-hidden"
                            title="X-API-KEY"
                        />
                        <button
                            onClick={() => handleCopy(customApiKey, 'apikey')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer"
                        >
                            {copiedSnippet === 'apikey' ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Salin Key</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-semibold">
                    <button
                        onClick={() => setActiveTab('endpoints')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                            activeTab === 'endpoints'
                                ? 'bg-orange-600 text-white shadow-2xs'
                                : 'text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>1. Spesifikasi Routing & Payload</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('models')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                            activeTab === 'models'
                                ? 'bg-orange-600 text-white shadow-2xs'
                                : 'text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>2. Kotlin Data Classes</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('retrofit')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                            activeTab === 'retrofit'
                                ? 'bg-orange-600 text-white shadow-2xs'
                                : 'text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>3. Retrofit & OkHttp Client</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('repository')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                            activeTab === 'repository'
                                ? 'bg-orange-600 text-white shadow-2xs'
                                : 'text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>4. Repository / Helper Android</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('sandbox')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                            activeTab === 'sandbox'
                                ? 'bg-orange-600 text-white shadow-2xs'
                                : 'text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>5. Interactive Test Sandbox</span>
                    </button>
                </div>

                {/* TAB 1: SPECIFICATION & ROUTING */}
                {activeTab === 'endpoints' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Endpoint List Sidebar */}
                        <div className="lg:col-span-4 space-y-2">
                            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
                                Daftar Endpoint API
                            </h3>
                            {Object.entries(endpoints).map(([key, ep]) => (
                                <div
                                    key={key}
                                    onClick={() => setSelectedEndpoint(key as any)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                        selectedEndpoint === key
                                            ? 'border-orange-500 bg-orange-50/50 shadow-2xs'
                                            : 'border-stone-200 bg-white hover:border-stone-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                            ep.method === 'POST'
                                                ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                        }`}>
                                            {ep.method}
                                        </span>
                                        <span className="font-mono text-xs font-semibold text-stone-900 truncate">
                                            {ep.path}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                                        {ep.title}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Endpoint Detail Content */}
                        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                        currentEp.method === 'POST'
                                            ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                    }`}>
                                        {currentEp.method}
                                    </span>
                                    <span className="font-mono text-sm font-bold text-stone-900">
                                        {currentEp.path}
                                    </span>
                                </div>
                                <h2 className="text-base font-bold text-stone-900">{currentEp.title}</h2>
                                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{currentEp.desc}</p>
                            </div>

                            {/* Parameters Table */}
                            {currentEp.params.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                                        JSON Request Body Parameters
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-stone-200">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                                                <tr>
                                                    <th className="p-2.5">Field Name</th>
                                                    <th className="p-2.5">Type</th>
                                                    <th className="p-2.5">Status</th>
                                                    <th className="p-2.5">Deskripsi & Contoh</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100 text-stone-700">
                                                {currentEp.params.map((param, i) => (
                                                    <tr key={i} className="hover:bg-stone-50/50">
                                                        <td className="p-2.5 font-mono font-semibold text-stone-900">{param.name}</td>
                                                        <td className="p-2.5 font-mono text-[11px] text-stone-500">{param.type}</td>
                                                        <td className="p-2.5">
                                                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                                                param.required
                                                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                                                    : 'bg-stone-100 text-stone-600'
                                                            }`}>
                                                                {param.required ? 'Wajib' : 'Opsional'}
                                                            </span>
                                                        </td>
                                                        <td className="p-2.5 text-[11px]">
                                                            <div>{param.desc}</div>
                                                            {param.example && (
                                                                <div className="font-mono text-[10px] text-stone-400 mt-0.5">
                                                                    Contoh: {param.example}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Request & Response Samples */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-800">Contoh Request Body:</span>
                                        <button
                                            onClick={() => handleCopy(JSON.stringify(currentEp.sampleRequest, null, 2), 'req_sample')}
                                            className="text-[11px] text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedSnippet === 'req_sample' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                            <span>Salin JSON</span>
                                        </button>
                                    </div>
                                    <pre className="p-3 rounded-lg bg-stone-900 text-stone-200 font-mono text-[11px] overflow-auto max-h-60 leading-relaxed">
                                        {JSON.stringify(currentEp.sampleRequest, null, 2)}
                                    </pre>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-stone-800">Contoh Response (HTTP 200/201):</span>
                                        <button
                                            onClick={() => handleCopy(JSON.stringify(currentEp.sampleResponse, null, 2), 'res_sample')}
                                            className="text-[11px] text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedSnippet === 'res_sample' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                            <span>Salin JSON</span>
                                        </button>
                                    </div>
                                    <pre className="p-3 rounded-lg bg-stone-900 text-stone-200 font-mono text-[11px] overflow-auto max-h-60 leading-relaxed">
                                        {JSON.stringify(currentEp.sampleResponse, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: KOTLIN DATA CLASSES */}
                {activeTab === 'models' && (
                    <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-stone-900">
                                    Model Data Class Kotlin (<code className="font-mono text-xs text-orange-800">UserMonitoringData.kt</code>, <code className="font-mono text-xs text-orange-800">Logs.kt</code>)
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Salin kode ini ke package <code className="font-mono text-[11px]">com.donggo.app.data.model</code> pada project Android Studio Anda.
                                </p>
                            </div>
                            <button
                                onClick={() => handleCopy(kotlinModelsSnippet, 'models_code')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {copiedSnippet === 'models_code' ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin Semua Model</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <pre className="p-4 rounded-xl bg-stone-900 text-stone-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[550px]">
                            {kotlinModelsSnippet}
                        </pre>
                    </div>
                )}

                {/* TAB 3: RETROFIT & OKHTTP SETUP */}
                {activeTab === 'retrofit' && (
                    <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-stone-900">
                                    Setup Retrofit & OkHttpClient Interceptor (<code className="font-mono text-xs text-orange-800">ApiClient.kt</code>)
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Otomatis menyisipkan header <code className="font-mono text-[11px] text-amber-800 font-bold">X-API-KEY: {customApiKey}</code> pada seluruh request.
                                </p>
                            </div>
                            <button
                                onClick={() => handleCopy(retrofitSnippet, 'retrofit_code')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {copiedSnippet === 'retrofit_code' ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin ApiClient.kt</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <pre className="p-4 rounded-xl bg-stone-900 text-stone-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[550px]">
                            {retrofitSnippet}
                        </pre>
                    </div>
                )}

                {/* TAB 4: REPOSITORY HELPER */}
                {activeTab === 'repository' && (
                    <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-stone-900">
                                    Repository & Helper Android (<code className="font-mono text-xs text-orange-800">DonggoMonitoringRepository.kt</code>)
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    Fungsi siap pakai untuk menyimpan profil siswa, tracking pemutaran video, dubbing suara, dan offline batch sync.
                                </p>
                            </div>
                            <button
                                onClick={() => handleCopy(repositorySnippet, 'repo_code')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer"
                            >
                                {copiedSnippet === 'repo_code' ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Tersalin</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin Repository.kt</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <pre className="p-4 rounded-xl bg-stone-900 text-stone-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[550px]">
                            {repositorySnippet}
                        </pre>
                    </div>
                )}

                {/* TAB 5: INTERACTIVE SANDBOX */}
                {activeTab === 'sandbox' && (
                    <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-stone-600" />
                                <h3 className="font-bold text-sm text-stone-900">Interactive API Sandbox</h3>
                            </div>
                            <span className="text-xs font-mono text-stone-500">
                                Target: <strong className="text-stone-800">{cleanBaseUrl}{currentEp.path}</strong>
                            </span>
                        </div>

                        {/* Endpoints selector */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {Object.entries(endpoints).map(([key, ep]) => (
                                <button
                                    key={key}
                                    onClick={() => handleSelectEndpoint(key as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border cursor-pointer ${
                                        selectedEndpoint === key
                                            ? 'bg-stone-900 border-stone-900 text-white font-semibold'
                                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                                    }`}
                                >
                                    <span className={`mr-1 font-mono font-bold ${ep.method === 'POST' ? 'text-orange-400' : 'text-emerald-400'}`}>
                                        {ep.method}
                                    </span>
                                    <span>{ep.path}</span>
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-stone-600">{currentEp.desc}</p>

                        {/* Request / Response Sandbox Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                            {/* Request Column */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                                    <span>JSON Request Payload:</span>
                                    <span className="font-mono text-[10px] text-stone-400">Header: X-API-KEY aktif</span>
                                </div>
                                <textarea
                                    value={requestPayload}
                                    onChange={(e) => setRequestPayload(e.target.value)}
                                    disabled={currentEp.method === 'GET'}
                                    rows={11}
                                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-900 focus:bg-white transition-colors outline-hidden"
                                />
                                <button
                                    onClick={handleExecuteRequest}
                                    disabled={isLoading}
                                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Sedang Mengirim ke Server...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Kirim Request ({currentEp.method} {currentEp.path})</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Response Column */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                                    <span>JSON Response Server:</span>
                                    {responseStatus && (
                                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold border ${
                                            responseStatus >= 200 && responseStatus < 300
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : 'bg-rose-50 text-rose-800 border-rose-200'
                                        }`}>
                                            HTTP {responseStatus}
                                        </span>
                                    )}
                                </div>
                                <pre className="w-full p-3 rounded-xl bg-stone-900 text-stone-200 font-mono text-xs min-h-[250px] max-h-[310px] overflow-auto leading-relaxed">
                                    {responseData || '// Klik tombol "Kirim Request" untuk melihat response langsung dari database MySQL'}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
