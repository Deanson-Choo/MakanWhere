import { apiFetch, type ErrorResponse } from './api';
import { type UserData } from './auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type UpdateProfileBody = {
    username?: string;
    email?: string
}

type UpdateProfileResponse = {
    success: boolean
    data: UserData
}

type DeleteProfileResponse = {
    success: boolean;
}

export async function updateProfile(body: UpdateProfileBody): Promise<UpdateProfileResponse> {
    const url = new URL(`${BASE_URL}/api/profile`);
    const res = await apiFetch(url.toString(), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data: UpdateProfileResponse | ErrorResponse = await res.json();

    if (!data.success) {
        throw new Error((data as ErrorResponse).message);
    }

    return data as UpdateProfileResponse;
}

export async function deleteProfile(): Promise<DeleteProfileResponse> {
    const url = new URL(`${BASE_URL}/api/profile`);
    const res = await apiFetch(url.toString(), {
        method: 'DELETE',
    });

    const data: DeleteProfileResponse | ErrorResponse = await res.json();

    if (!data.success) {
        throw new Error((data as ErrorResponse).message);
    }

    return data as DeleteProfileResponse;
}


