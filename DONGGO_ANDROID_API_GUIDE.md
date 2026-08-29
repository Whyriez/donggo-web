# DONGGO ANDROID API INTEGRATION GUIDE & SPECIFICATION

> **Dokumentasi Resmi Integrasi Backend REST API Donggo Web ke Aplikasi Android (Kotlin)**
> File ini dirancang khusus untuk diberikan langsung kepada Developer / Agent AI Android.

---

## 1. Ringkasan & Konfigurasi Jaringan Android

### Base URL:

- **Android Emulator (Default)**: `http://10.0.2.2:8000/`
- **Real Device (Satu Jaringan Wi-Fi)**: `http://<IP_KOMPUTER_ANDA>:8000/` (Contoh: `http://192.168.1.10:8000/`)
- **Production**: `https://donggo-api.limapp.my.id/`

### 🔑 Mandatory Security Header:

Setiap request ke backend **WAJIB** menyertakan header berikut:

```http
X-API-KEY: donggo_secret_key_2026_xyz
Content-Type: application/json
Accept: application/json
```

_(Catatan: Jika header `X-API-KEY` tidak disertakan atau salah, server akan mengembalikan response `HTTP 401 Unauthorized`)._

### ⚠️ Android Manifest Setup (Cleartext Traffic):

Tambahkan izin internet dan konfigurasi cleartext di `AndroidManifest.xml` untuk pengujian HTTP lokal:

```xml
<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:usesCleartextTraffic="true"
        ...>
    </application>
</manifest>
```

---

## 2. Model Data Kotlin (`com.donggo.app.data.model`)

Salin data class berikut ke dalam project Android Studio:

```kotlin
package com.donggo.app.data.model

import com.google.gson.annotations.SerializedName

// ==========================================
// 1. Generic API Response Wrapper
// ==========================================
data class ApiResponse<T>(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: T? = null
)

// ==========================================
// 2. Profil Siswa (UserMonitoringData)
// ==========================================
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
    @SerializedName("name") val name: String,
    @SerializedName("created_at") val createdAt: String?
)

// ==========================================
// 3. Request Log Pemutaran Video
// ==========================================
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

// ==========================================
// 4. Request Log Dubbing / Pergantian Suara
// ==========================================
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

// ==========================================
// 5. Request & Response Batch Sync Offline
// ==========================================
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
)

// ==========================================
// 6. Katalog Cerita & Scene
// ==========================================
data class Story(
    @SerializedName("id") val id: Int,
    @SerializedName("slug") val slug: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?,
    @SerializedName("category") val category: String?,
    @SerializedName("thumbnail") val thumbnail: String?,
    @SerializedName("total_scenes") val totalScenes: Int,
    @SerializedName("scenes") val scenes: List<Scene> = emptyList()
)

data class Scene(
    @SerializedName("id") val id: Int,
    @SerializedName("story_id") val storyId: Int,
    @SerializedName("scene_number") val sceneNumber: Int,
    @SerializedName("title") val title: String,
    @SerializedName("video_asset") val videoAsset: String?,
    @SerializedName("character_name") val characterName: String?,
    @SerializedName("gorontalo_script") val gorontaloScript: String?,
    @SerializedName("indonesian_translation") val indonesianTranslation: String?
)
```

---

## 3. Network Client & Retrofit (`com.donggo.app.data.network`)

File konfigurasi Retrofit dengan otomatis menyisipkan header `X-API-KEY`:

```kotlin
package com.donggo.app.data.network

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
    // Ambil Katalog Cerita & Naskah Gorontalo
    @GET("api/v1/stories")
    suspend fun getStories(): Response<ApiResponse<List<Story>>>

    // Registrasi / Update Profil Siswa
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

    // Health Check Status
    @GET("api/v1/summary")
    suspend fun getSummary(): Response<Map<String, Any>>
}

// 2. Singleton Network Client
object ApiClient {
    // Ganti dengan 10.0.2.2 untuk emulator atau IP LAN untuk real device
    private const val BASE_URL = "http://10.0.2.2:8000/"
    private const val API_KEY = "donggo_secret_key_2026_xyz"

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
}
```

---

## 4. Repository & Helper Android (`DonggoMonitoringRepository.kt`)

Helper siap pakai untuk dipanggil dari ViewModel / Activity / Composable:

```kotlin
package com.donggo.app.data.repository

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
        ) ?: "unknown_android_device"
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
                Result.failure(Exception(response.message() ?: "Gagal menyimpan profil siswa"))
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
        videoName: String = "",
        durationSeconds: Int = 0,
        isCompleted: Boolean = true
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
                Result.failure(Exception("HTTP ${response.code()}: ${response.message()}"))
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
        audioDurationSeconds: Double = 0.0,
        replacementCount: Int = 1
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val payload = VoiceReplacementLogRequest(
                storyTitle = storyTitle,
                sceneTitle = sceneTitle,
                actionType = "replaced",
                replacementCount = replacementCount,
                audioDurationSeconds = audioDurationSeconds,
                deviceId = getDeviceId()
            )
            val response = api.logVoiceReplacement(payload)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("HTTP ${response.code()}: ${response.message()}"))
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
                Result.failure(Exception("Sync failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

---

## 5. Rincian Lengkap Endpoint REST API

### 1. Registrasi / Update Profil Siswa

- **Endpoint**: `POST /api/v1/user`
- **Deskripsi**: Mendaftarkan profil siswa. Jika `deviceId` sudah pernah ada, data profil akan otomatis diperbarui (_upsert_).
- **Header**:
    - `X-API-KEY: donggo_secret_key_2026_xyz`
    - `Content-Type: application/json`
- **JSON Request Body**:

```json
{
    "name": "Fahri Pratama",
    "age": "10",
    "gender": "Laki-laki",
    "educationLevel": "SD",
    "educationClass": "Kelas 4",
    "gorontaloFrequency": "Jarang",
    "appGoal": "Belajar kosakata cerita rakyat Gorontalo",
    "agePhase": "Anak-anak (7-12 tahun)",
    "deviceId": "donggo-android-uuid-98765"
}
```

- **JSON Response (`201 Created`)**:

```json
{
    "status": "success",
    "message": "User monitoring data saved successfully",
    "data": {
        "id": 1,
        "user_id": 1,
        "device_id": "donggo-android-uuid-98765",
        "name": "Fahri Pratama",
        "created_at": "2026-08-27T10:30:00.000000Z"
    }
}
```

---

### 2. Kirim Log Pemutaran Video

- **Endpoint**: `POST /api/v1/video-play`
- **Deskripsi**: Mengirim log ketika video scene animasi selesai diputar atau ditonton siswa.
- **Header**:
    - `X-API-KEY: donggo_secret_key_2026_xyz`
    - `Content-Type: application/json`
- **JSON Request Body**:

```json
{
    "device_id": "donggo-android-uuid-98765",
    "story_title": "Legenda Lahilote (Batu Pohe)",
    "scene_title": "Scene 1: Pertemuan di Mata Air Hulu Sungai",
    "video_name": "lahilote_scene_1.mp4",
    "duration_seconds": 45,
    "is_completed": true
}
```

- **JSON Response (`201 Created`)**:

```json
{
    "status": "success",
    "message": "Video play logged successfully",
    "data": {
        "log_id": 82,
        "story_title": "Legenda Lahilote (Batu Pohe)",
        "scene_title": "Scene 1: Pertemuan di Mata Air Hulu Sungai",
        "played_at": "2026-08-27T10:30:15.000000Z"
    }
}
```

---

### 3. Kirim Log Pergantian Suara / Dubbing

- **Endpoint**: `POST /api/v1/voice-replace`
- **Deskripsi**: Mengirim log ketika siswa merekam suaranya untuk mengisi suara karakter pada scene.
- **Header**:
    - `X-API-KEY: donggo_secret_key_2026_xyz`
    - `Content-Type: application/json`
- **JSON Request Body**:

```json
{
    "device_id": "donggo-android-uuid-98765",
    "story_title": "Legenda Lahilote (Batu Pohe)",
    "scene_title": "Scene 1: Pertemuan di Mata Air Hulu Sungai",
    "action_type": "replaced",
    "replacement_count": 1,
    "audio_duration_seconds": 12.4
}
```

- **JSON Response (`201 Created`)**:

```json
{
    "status": "success",
    "message": "Voice replacement logged successfully",
    "data": {
        "log_id": 50,
        "story_title": "Legenda Lahilote (Batu Pohe)",
        "scene_title": "Scene 1: Pertemuan di Mata Air Hulu Sungai",
        "replacement_count": 1,
        "recorded_at": "2026-08-27T10:30:30.000000Z"
    }
}
```

---

### 4. Sinkronisasi Sekaligus / Batch Sync (Offline-to-Online)

- **Endpoint**: `POST /api/v1/sync-batch`
- **Deskripsi**: Mengirim kumpulan riwayat pemutaran dan dubbing yang tersimpan di memori lokal Android saat offline dalam 1 transaksi.
- **Header**:
    - `X-API-KEY: donggo_secret_key_2026_xyz`
    - `Content-Type: application/json`
- **JSON Request Body**:

```json
{
    "user": {
        "name": "Dimas Prasetyo",
        "age": "9",
        "gender": "Laki-laki",
        "educationLevel": "SD",
        "educationClass": "Kelas 3",
        "gorontaloFrequency": "Jarang",
        "appGoal": "Latihan berbicara bahasa Gorontalo lewat video",
        "agePhase": "Anak-anak (7-12 tahun)",
        "deviceId": "donggo-android-uuid-11223"
    },
    "video_plays": [
        {
            "story_title": "Asal Usul Danau Limboto (Bulalo Limboto)",
            "scene_title": "Scene 1: Mata Air Suci di Lembah Hijau",
            "video_name": "limboto_scene_1.mp4",
            "duration_seconds": 40,
            "is_completed": true,
            "played_at": "2026-08-27 14:10:00"
        }
    ],
    "voice_replacements": [
        {
            "story_title": "Asal Usul Danau Limboto (Bulalo Limboto)",
            "scene_title": "Scene 1: Mata Air Suci di Lembah Hijau",
            "action_type": "replaced",
            "replacement_count": 2,
            "audio_duration_seconds": 10.4,
            "recorded_at": "2026-08-27 14:15:00"
        }
    ]
}
```

- **JSON Response (`200 OK`)**:

```json
{
    "status": "success",
    "message": "Batch monitoring data synced successfully",
    "data": {
        "user_id": 5,
        "synced_video_plays": 1,
        "synced_voice_replacements": 1,
        "synced_at": "2026-08-27T10:31:00.000000Z"
    }
}
```

---

### 5. Mengambil Katalog Cerita & Adegan

- **Endpoint**: `GET /api/v1/stories`
- **Header**:
    - `X-API-KEY: donggo_secret_key_2026_xyz`
    - `Accept: application/json`
- **JSON Response (`200 OK`)**:

```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "slug": "legenda-lahilote",
            "title": "Legenda Lahilote (Batu Pohe)",
            "description": "Kisah heroik Lahilote yang bertemu dengan bidadari kahyangan...",
            "category": "Cerita Rakyat Gorontalo",
            "thumbnail": "/images/lahilote.jpg",
            "total_scenes": 3,
            "scenes": [
                {
                    "id": 1,
                    "story_id": 1,
                    "scene_number": 1,
                    "title": "Scene 1: Pertemuan di Mata Air Hulu Sungai",
                    "video_asset": "lahilote_scene_1.mp4",
                    "character_name": "Lahilote",
                    "gorontalo_script": "Oliyo ta mohelato, wau yilowali mota to hungayo.",
                    "indonesian_translation": "Dia sangat rupawan dan anggun, aku terpesona di tepi sungai."
                }
            ]
        }
    ]
}
```

---

## 6. Contoh Pemanggilan di ViewModel Android

```kotlin
class StoryPlayerViewModel(
    private val repository: DonggoMonitoringRepository
) : ViewModel() {

    // 1. Panggil saat video selesai diputar
    fun onVideoFinished(storyTitle: String, sceneTitle: String, duration: Int) {
        viewModelScope.launch {
            repository.trackVideoPlay(
                storyTitle = storyTitle,
                sceneTitle = sceneTitle,
                durationSeconds = duration,
                isCompleted = true
            )
        }
    }

    // 2. Panggil saat dubbing suara selesai disimpan
    fun onVoiceRecorded(storyTitle: String, sceneTitle: String, audioDuration: Double) {
        viewModelScope.launch {
            repository.trackVoiceDubbing(
                storyTitle = storyTitle,
                sceneTitle = sceneTitle,
                audioDurationSeconds = audioDuration
            )
        }
    }
}
```
