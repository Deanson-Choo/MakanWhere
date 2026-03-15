import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Location } from "../types/location";
import { API_BASE_URL } from "../constants/api";

export default function useLocation(mapbox_id: string, session_token: string) {
    const [searchResult, setSearchResult] = useState<Location | null>(null);

    useEffect(() => {
        if (!mapbox_id || !session_token) return;

        const fetchLocation = async () => {
            try {
                const url = new URL(`${API_BASE_URL}/mapbox/locations/${mapbox_id}`);
                url.searchParams.append("session_token", session_token);
                const res = await fetch(url.toString());

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Could not fetch location details');
                }

                const data = await res.json();
                setSearchResult(data);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : "Could not fetch location details";
                Alert.alert("Error", errorMessage);
                console.error(e);
            }
        };

        const fetchReviewedLocation = async () => {
            try {
                const url = new URL(`${API_BASE_URL}/app/reviews/1/${mapbox_id}`);
                const res = await fetch(url.toString());

                if (!res.ok) {
                    await fetchLocation();
                    return;
                }

                const data = await res.json();
                if (!data.data) {
                    await fetchLocation();
                    return;
                }

                setSearchResult({
                    mapbox_id: data.data.locationId,
                    place_name: data.data.location.place_name,
                    address: data.data.location.address,
                    latitude: data.data.location.latitude,
                    longitude: data.data.location.longitude,
                    rating: data.data.rating,
                    comment: data.data.comment,
                });
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : "Could not fetch reviewed location";
                Alert.alert("Error", errorMessage);
                console.error(e);
            }
        };

        fetchReviewedLocation();
    }, [mapbox_id, session_token]);

    return searchResult;
}
