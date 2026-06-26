import { apiFetch, type ErrorResponse } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type ReviewEntry = {
    id: number;
    food_rating: number;
    atmosphere_rating: number;
    worth_it_rating: number;
    meal_type: MealType | null;
    amount_spent: AmountSpent | null;
    tags: string[] | null;
    remarks: string | null;
    image_urls: string[] | null;
    created_at: string;
    updated_at: string;
}

export type Review = {
    mapbox_id: string;
    place_name: string;
    address: string;
    latitude: number;
    longitude: number;
    cuisine_types: string[] | null;
    reviews: ReviewEntry[];
}

export type AmountSpent = '1-10' | '10-20' | '20-30' | '30-40' | '40-50' | '>50';
export type MealType = 'Breakfast' | 'Brunch' | 'Lunch' | 'Dinner' | 'Supper';

type CreateReviewBody = {
    location: {
        mapbox_id: string;
        place_name: string;
        address: string;
        latitude: number;
        longitude: number;
        cuisine_types?: string[];
    };
    review: {
        food_rating: number;
        atmosphere_rating: number;
        worth_it_rating: number;
        meal_type?: MealType;
        amount_spent?: AmountSpent;
        tags?: string[];
        remarks?: string;
        image_urls?: string[];
    };
};

export type UpdateReviewBody = {
    food_rating?: number;
    atmosphere_rating?: number;
    worth_it_rating?: number;
    meal_type?: MealType | null;
    amount_spent?: AmountSpent | null;
    tags?: string[] | null;
    remarks?: string | null;
    image_urls?: string[] | null;
};

type GetReviewsResponse = {
    success: boolean;
    data: Review[];
}

type UpdateReviewResponse = {
    success: boolean;
    data: ReviewEntry;
}

type DeleteReviewResponse = {
    success: boolean;
    data: null;
}

type CreateReviewResponse = {
    success: boolean;
    data: ReviewEntry;
}


export async function getReviews(): Promise<GetReviewsResponse> {
    const url = new URL(`${BASE_URL}/api/reviews`);
    const res = await apiFetch(url.toString(), {
        method: 'GET'
    });

    const data: GetReviewsResponse | ErrorResponse = await res.json();

    if (!data.success) {
        // Let the caller handle the error 
        throw new Error((data as ErrorResponse).message);
    }

    return data as GetReviewsResponse;
}

export async function updateReview(id: number, body: UpdateReviewBody): Promise<UpdateReviewResponse> {
    const url = new URL(`${BASE_URL}/api/reviews/${id}`);
    const res = await apiFetch(url.toString(), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data: UpdateReviewResponse | ErrorResponse = await res.json();

    if (!data.success) {
        throw new Error((data as ErrorResponse).message);
    }

    return data as UpdateReviewResponse;
}

export async function deleteReview(id: number): Promise<DeleteReviewResponse> {
    const url = new URL(`${BASE_URL}/api/reviews/${id}`);
    const res = await apiFetch(url.toString(), {
        method: 'DELETE',
    });

    const data: DeleteReviewResponse | ErrorResponse = await res.json();

    if (!data.success) {
        throw new Error((data as ErrorResponse).message);
    }

    return data as DeleteReviewResponse;
}

export async function createReview(body: CreateReviewBody): Promise<CreateReviewResponse> {
    const url = new URL(`${BASE_URL}/api/reviews`);
    const res = await apiFetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data: CreateReviewResponse | ErrorResponse = await res.json();

    if (!data.success) {
        throw new Error((data as ErrorResponse).message);
    }

    return data as CreateReviewResponse;
}
