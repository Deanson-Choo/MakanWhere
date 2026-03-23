import { BASE_URL } from "@/services/api";
import { Alert } from "react-native";
import { Suggestion } from "@/types/suggestion";
import { Location } from "@/types/location";

export async function fetchLocations(query: string, sessionToken: string): Promise<Suggestion[] | undefined> {
    try {
        const url = new URL(`${BASE_URL}/mapbox/locations/search`);
        url.searchParams.append("query", query);
        url.searchParams.append("session_token", sessionToken);
        const res = await fetch(url);

        const body = await res.json();

        if (!body.success) {
            Alert.alert('Search Failed', body.message);
            return;
        }

        return body.data.suggestions as Suggestion[];
    } catch {
        Alert.alert('Search Failed', 'An unexpected error occurred.');
    }
}

export async function fetchLocationDetails(sessionToken: string, mapboxId: string): Promise<Location | undefined> {
    try {
        const url = new URL(`${BASE_URL}/mapbox/locations/${mapboxId}`);
        url.searchParams.append("session_token", sessionToken);
        const res = await fetch(url);

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
