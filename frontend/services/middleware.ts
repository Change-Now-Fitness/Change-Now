/**
 * Auth-aware request wrapper used by screens/services.
 *
 * How it fits:
 * - Central place that attaches auth for protected backend endpoints.
 * - Web: sends cookies via `credentials: include` (backend uses httpOnly `token` cookie).
 * - Native: reads SecureStore JWT and sends `Authorization: Bearer ...`.
 * - Uses `buildApiUrl()` so all calls respect `EXPO_PUBLIC_API_URL`.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { buildApiUrl } from '@/lib/config';
const platform = Platform.OS;
const TOKEN_KEY = "user_token";

type ApiRequestResult<T = unknown> = {
    success: boolean;
    status: number;
    data: T | null;
    message: string;
};

/**
 * Augments api fetch with auth tokens, takes api path and http options, returns success bool and data
 * @param endpointURL 
 * @param options use Method, Content type, and Body
 * @returns 
 */
export async function apiRequest<T = unknown>(
    endpointURL: string,
    options: RequestInit = {}
): Promise<ApiRequestResult<T>> {

    const reqHeaders = new Headers(options.headers);
    //for non web, gets local storage token and appends appropriate headers to request
    if (platform !== 'web') {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token === null) {
                console.log('null token');
                return {
                    success: false,
                    status: 401,
                    data: null,
                    message: 'Authentication token not found',
                };
            }
            reqHeaders.set('Authorization', `Bearer ${token}`);
        } catch (error) {
            console.log('could not obtain valid storage token in middleware');
            return {
                success: false,
                status: 0,
                data: null,
                message: error instanceof Error ? error.message : 'Failed to read auth token',
            };
        }
    } 

    //append argument options and send req 
    try {
        const response = await fetch(buildApiUrl(endpointURL), {
            ...options, //appends options from arguments
            credentials: platform === 'web' ? 'include' : "omit",
            headers: reqHeaders
        });

        let jsonData: T | null = null;
        try {
            jsonData = await response.json();
        } catch {
            jsonData = null;
        }

        if (!response.ok) {
            if (platform !== 'web' && response.status === 401) {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
            }

            const errorMessage =
                (jsonData as { error?: string; message?: string } | null)?.error ||
                (jsonData as { error?: string; message?: string } | null)?.message ||
                `Request failed with status ${response.status}`;

            return {
                success: false,
                status: response.status,
                data: jsonData,
                message: errorMessage,
            };
        }

        return {
            success: true,
            status: response.status,
            data: jsonData,
            message: "",
        };
    } catch (error) {
        console.log('request to backend faied, reporting from middleware');
        return {
            success: false,
            status: 0,
            data: null,
            message: error instanceof Error ? error.message : 'Network request failed',
        };
    }
}
