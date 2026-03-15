export type Location = {
    mapbox_id: string;
    place_name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating?: number;
    comment?: string;
}