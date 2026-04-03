export type Location = {
    id?: number;
    mapbox_id: string;
    place_name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating?: number;
    comment?: string;
    image_url?: string;
}