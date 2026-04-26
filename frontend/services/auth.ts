import { BASE_URL } from "./api";
import { Alert } from "react-native";
import useAuthStore from "@/store/authStore";

export type UserData = {
    id: number;
    username: string;
    email: string;
}

type ValidationError = {
    type: string,
    msg: string,
    path: string,
    location: string
    value: string
}

type AuthResponse = {
    success: boolean;
    data: UserData;
    token: string;
}

type AuthError = {
    success: boolean;
    message: string;
    errors?: ValidationError[];
}

type UpdateProfileResponse = {
    success: boolean;
    message: string;
    data: UserData;
}

type DeleteProfileResponse = {
    success: boolean;
}

export async function login(email: string, password: string) {
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const body = await res.json() as AuthResponse | AuthError;
        
        if (!body.success) {
            Alert.alert('Login Failed', (body as AuthError).message);
            return;
        }
        const { data, token } = body as AuthResponse;
        useAuthStore.getState().login(data, token);
    } catch (error) {
        Alert.alert('Login Failed', (error as Error).message);
    } 
}

export async function register(email: string, username: string, password: string) {
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
        });

        const body = await res.json() as AuthResponse | AuthError;

        if (!body.success) {
            Alert.alert('Registration Failed', (body as AuthError).message);
            return;
        }
        const { data, token } = body as AuthResponse;
        useAuthStore.getState().signup(data, token);
    } catch (error) {
        Alert.alert('Registration Failed', (error as Error).message);
    }
}

export async function updateProfile(email?: string, username?: string, password?: string) {
    const token = useAuthStore.getState().token;
    try {
        const url = new URL(`${BASE_URL}/profile`);
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ email, username, password }),
        });

        const body = await res.json() as UpdateProfileResponse | AuthError;

        if (!body.success) {
            Alert.alert('Fetch Failed', (body as AuthError).message);
            return;
        }

        const { data } = body as UpdateProfileResponse;
        useAuthStore.getState().updateProfile(data);

        Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
    } catch {
        Alert.alert('Fetch Failed', 'An unexpected error occurred.');
    }
}

export async function deleteProfile() {
    const token = useAuthStore.getState().token;
    try {
        const url = new URL(`${BASE_URL}/profile`);
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const body = await res.json() as DeleteProfileResponse | AuthError;

        if (!body.success) {
            Alert.alert('Delete Failed', (body as AuthError).message);
            return;
        }

        useAuthStore.getState().logout();

    } catch {
        Alert.alert('Delete Failed', 'An unexpected error occurred while trying to delete your profile.');
    }
}

export function logout() {
    useAuthStore.getState().logout();
}
    