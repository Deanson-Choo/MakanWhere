import { query } from '../lib/db.js';
import { upsertLocation } from './location.model.js';

export async function getReviewsByUserId(userId) {
    const text = `
        SELECT r.id, l.mapbox_id, l.place_name, l.address, l.latitude, l.longitude, r.rating, r.comment
        FROM "Review" r
        JOIN "Location" l
        ON r."locationId" = l.mapbox_id
        WHERE r."userId" = $1
        ORDER BY r."createdAt" DESC
    `;

    const values = [userId];
    const { rows } = await query(text, values);
    return rows; // Return all reviews by the user
}

export async function getReviewsByLocationIdByUserId(userId, mapbox_id) {
    const text = `
        SELECT r.id, l.mapbox_id, l.place_name, l.address, l.latitude, l.longitude, r.rating, r.comment
        FROM "Review" r
        JOIN "Location" l
        ON r."locationId" = l.mapbox_id
        WHERE r."locationId" = $1 AND r."userId" = $2
    `;

    const values = [mapbox_id, userId];
    const { rows } = await query(text, values);
    return rows[0]; // Return the single review for this location by this user
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

export async function getOwnerOfReview(reviewId) {
    const text = `
        SELECT "userId"
        FROM "Review"
        WHERE id = $1
    `;
    const values = [reviewId];
    const { rows } = await query(text, values);
    return rows[0]?.userId; // Return the userId of the review owner
}

export async function updateDBReview(reviewId, rating, comment) {
    const text = `
        UPDATE "Review"
        SET rating = $1, comment = $2
        WHERE id = $3
        RETURNING *
    `;
    const values = [rating, comment, reviewId]
    const { rows } = await query(text,values)
    return rows[0] // Return the updated review
}

export async function deleteDBReview(reviewId) {
    const text = `
        DELETE FROM "Review"
        WHERE id = $1
        RETURNING *
    `;
    const values = [reviewId]
    const { rows } = await query(text,values)
    return rows[0] // Return the deleted review
}