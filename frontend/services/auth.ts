import { apiFetch, type ErrorResponse } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Payload definition
export type UserData = {
    id: number
    username: string
    email: string
}

export type RegisterResponse = {
    success: boolean
    data: UserData
    accessToken: string
    refreshToken: string
}

export type LoginResponse = {
    success: boolean
    data: UserData
    accessToken: string
    refreshToken: string
}

export type LogoutResponse = {
    success: boolean
}

export async function register(username: string, email: string, password: string): Promise<RegisterResponse> {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    const data: RegisterResponse | ErrorResponse = await res.json();

    if (!data.success) {
        // Let the caller handle the error 
        throw new Error((data as ErrorResponse).message);
    }

    return data as RegisterResponse;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse | ErrorResponse = await res.json();

    if (!data.success) {
        // Let the caller handle the error 
        throw new Error((data as ErrorResponse).message);
    }
    
    return data as LoginResponse;
}

export async function logout(): Promise<LogoutResponse> {
    const res = await apiFetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
    });

    const data: LogoutResponse | ErrorResponse = await res.json();

    if (!data.success) {
        // Let the caller handle the error 
        throw new Error((data as ErrorResponse).message);
    }

    return data as LogoutResponse;
}


