import { query } from '../lib/db.js';

export async function upsertLocation(mapbox_id, place_name, address, latitude, longitude, cuisine_types) {
    const text = `
        INSERT INTO locations (mapbox_id, place_name, address, latitude, longitude, cuisine_types)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (mapbox_id) DO NOTHING
    `;

    const values = [mapbox_id, place_name, address, latitude, longitude, cuisine_types ?? null];
    await query(text, values);
}