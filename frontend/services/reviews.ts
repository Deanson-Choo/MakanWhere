import { Location } from "@/types/location";
import { Alert } from "react-native";
import { BASE_URL } from "./api";
import useAuthStore from '@/store/authStore';

export async function fetchReviewsByUser(): Promise<Location[] | undefined> {
    const token = useAuthStore.getState().token;
    try {
        const url = new URL(`${BASE_URL}/reviews/user`);
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const body = await res.json();

        if (!body.success) {
            Alert.alert('Fetch Failed', body.message);
            return;
        }

        return body.data as Location[];
    } catch {
        Alert.alert('Fetch Failed', 'An unexpected error occurred.');
    }
}

export async function fetchReviewsByUserByLocation(mapbox_id: string): Promise<Location | undefined> {
    const token = useAuthStore.getState().token;
    try {
        const url = new URL(`${BASE_URL}/reviews/user/location/${mapbox_id}`);
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const body = await res.json();

        if (!body.success) {
            Alert.alert('Fetch Failed', body.message);
            return;
        }

        return body.data as Location;
    } catch {
        Alert.alert('Fetch Failed', 'An unexpected error occurred.');
    }
}

type ReviewPayload = {
    mapbox_id: string;
    rating: number;
    comment: string;
    place_name: string;
    address: string;
    latitude: number;
    longitude: number;
}

export async function submitReview(payload: ReviewPayload) {
    const token = useAuthStore.getState().token;
    try {
        const url = new URL(`${BASE_URL}/reviews/user`);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        const body = await res.json();

        if (!body.success) {
            Alert.alert('Submission Failed', body.message);
            return;
        }

        Alert.alert('Review Submitted', 'Your review has been submitted successfully.');

    } catch {
        Alert.alert('Submission Failed', 'An unexpected error occurred.');
    }   
}

export async function updateReview(reviewId: number, rating: number, comment: string) {
    const token = useAuthStore.getState().token;
    try {
        const url = new URL(`${BASE_URL}/reviews/${reviewId}`)
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({rating, comment})
        });

        const body = await res.json()

        if (!body.success) {
            Alert.alert('Update failed', body.message)
            return;
        }

        Alert.alert('Update Successful')

    } catch {
        Alert.alert('Update Failed')
    }
}

export async function deleteReview(reviewId: number) {
    const token = useAuthStore.getState().token;
    try {
        const url = new URL(`${BASE_URL}/reviews/${reviewId}`)
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const body = await res.json()

        if (!body.success) {
            Alert.alert('Delete failed', body.message)
            return;
        }

        Alert.alert('Delete Successful')

    } catch {
        Alert.alert('Delete Failed', 'An unexpected error occurred.');
    }
}
