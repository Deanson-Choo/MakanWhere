import { Platform } from 'react-native';
import useAuthStore from '@/store/authStore';

const host = process.env.EXPO_PUBLIC_API_HOST ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const port = process.env.EXPO_PUBLIC_API_PORT ?? '3000';

export const BASE_URL = `http://${host}:${port}/api`;

export async function authFetch(path: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
  }

  return res.json();
}