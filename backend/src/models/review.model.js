import { query } from '../lib/db.js';
import { upsertLocation } from './location.model.js';

export async function getReviewsByUserId(userId) {
    const text = `
        SELECT *
        FROM "Review"
        WHERE "userId" = $1
    `;

    const values = [userId];
    const { rows } = await query(text, values);
    return rows; // Return all reviews by the user
}

export async function createDBReview(userId, mapbox_id, rating, comment, place_name, address, latitude, longitude) {
    // First, ensure the location exists in the Location table
    await upsertLocation(mapbox_id, place_name, address, latitude, longitude);

    // Now insert the review
    const text = `
        INSERT INTO "Review" ("userId", rating, comment, "locationId")
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    
    const values = [userId, rating, comment, mapbox_id]; 
    const { rows } = await query(text, values);
    return rows[0]; // Return the newly created review
}