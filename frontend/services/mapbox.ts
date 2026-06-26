import { apiFetch, type ErrorResponse } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type Location = {
    mapbox_id: string
    name: string
    address: string
    latitude: number
    longitude: number
    cuisine_types: string[]
}

export type Suggestion = {
    mapbox_id: string
    name: string
    address: string
}

type FetchSuggestionsResponse = {
    success: boolean
    data: Suggestion[]
}

type FetchLocationDetailsResponse = {
    success: boolean
    data: Location
}

export async function fetchSuggestions(query: string, sessionToken: string): Promise<FetchSuggestionsResponse> {
    const url = new URL(`${BASE_URL}/api/mapbox/search/suggestions`);
    url.searchParams.append('query', query);
    url.searchParams.append('session_token', sessionToken);
    const res = await apiFetch(url.toString(), {
        method: 'GET'
    });

    const data: FetchSuggestionsResponse | ErrorResponse = await res.json();

    if (!data.success) {
        // Let the caller handle the error 
        throw new Error((data as ErrorResponse).message);
    }

    return data as FetchSuggestionsResponse;
}

export async function fetchLocationDetails(mapboxId: string, sessionToken: string): Promise<FetchLocationDetailsResponse> {
    const url = new URL(`${BASE_URL}/api/mapbox/search/${mapboxId}`);
    url.searchParams.append('session_token', sessionToken);
    const res = await apiFetch(url.toString(), {
        method: 'GET'
    });

    const data: FetchLocationDetailsResponse | ErrorResponse = await res.json();

    if (!data.success) {
        // Let the caller handle the error 
        throw new Error((data as ErrorResponse).message);
    }

    return data as FetchLocationDetailsResponse;
}


