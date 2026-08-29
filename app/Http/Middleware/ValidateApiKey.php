<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiKey
{
    /**
     * Handle an incoming request and validate the X-API-KEY header.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $configuredKey = config('services.donggo.api_key') ?: env('DONGGO_API_KEY', 'donggo_secret_api_key_2026');

        // Extract key from header X-API-KEY, Authorization Bearer, or query parameter
        $providedKey = $request->header('X-API-KEY')
            ?? $request->header('x-api-key')
            ?? $request->bearerToken()
            ?? $request->query('api_key');

        if (empty($providedKey) || ! hash_equals((string) $configuredKey, (string) $providedKey)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: API key tidak valid atau header X-API-KEY tidak disertakan.',
                'hint' => 'Sertakan header "X-API-KEY: <api_key>" pada setiap request.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
