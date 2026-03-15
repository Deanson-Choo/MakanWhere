import { query } from '../lib/db.js';

export async function upsertLocation(mapbox_id, place_name, address, latitude, longitude) {
    const text = `
        INSERT INTO "Location" (mapbox_id, place_name, address, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (mapbox_id) DO NOTHING
    `;

    const values = [mapbox_id, place_name, address, latitude, longitude];
    await query(text, values);
}