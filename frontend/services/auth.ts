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

export function logout() {
    useAuthStore.getState().logout();
}
    