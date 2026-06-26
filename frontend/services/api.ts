import useAuthStore from '@/store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type ErrorResponse = {
    success: boolean
    message: string
    errors?: { field: string, message: string }[]
}

export type RefreshTokenResponse = {
    success: boolean
    accessToken: string
    refreshToken: string
}

// Rewrite headers to include Bearer token
function withAuth(token: string | null, init?: RequestInit): RequestInit {
    return { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } };
}

export async function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    const data: RefreshTokenResponse | ErrorResponse = await res.json();

    if (!data.success) {
        throw new Error((data as ErrorResponse).message);
    }

    return data as RefreshTokenResponse;
}

// Use this for protected API calls that require authentication. It will automatically attempt to refresh the token if it receives a 401 response, and retry the original request with the new token.
export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
    const store = useAuthStore.getState();

    const res = await fetch(url, withAuth(store.accessToken, init));
    // If the access token is still valid, return the response
    if (res.status !== 401) return res;

    if (!store.refreshToken) {
        store.logout();
        throw new Error('Session expired. Please log in again.');
    }

    try {
        // Attempt to refresh the token
        const { accessToken, refreshToken: newRefreshToken } = await refreshToken(store.refreshToken);
        store.refresh(accessToken, newRefreshToken);
        return fetch(url, withAuth(accessToken, init));
    } catch {
        // If token refresh fails, log out the user
        store.logout();
        throw new Error('Session expired. Please log in again.');
    }
}
