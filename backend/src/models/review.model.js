import { query } from '../lib/db.js';
import { upsertLocation } from './location.model.js';

export async function getReviews(userId) {
    const text = `
        SELECT
            l.mapbox_id, l.place_name, l.address, l.latitude, l.longitude, l.cuisine_types,
            json_agg(
                json_build_object(
                    'id',                r.id,
                    'food_rating',       r.food_rating,
                    'atmosphere_rating', r.atmosphere_rating,
                    'worth_it_rating',   r.worth_it_rating,
                    'amount_spent',      r.amount_spent,
                    'tags',              r.tags,
                    'remarks',           r.remarks,
                    'image_urls',        r.image_urls,
                    'created_at',        r.created_at,
                    'updated_at',        r.updated_at
                ) ORDER BY r.created_at DESC
            ) AS reviews
        FROM reviews r
        JOIN locations l ON r.location_id = l.mapbox_id
        WHERE r.user_id = $1
        GROUP BY l.mapbox_id
    `;

    const values = [userId];
    const { rows } = await query(text, values);
    return rows;
}

export async function createReview(userId, mapbox_id, place_name, address, latitude, longitude, cuisine_types, food_rating, atmosphere_rating, worth_it_rating, amount_spent, tags, remarks, image_urls) {
    // Ensure the location exists in the database (insert if not exists)
    await upsertLocation(mapbox_id, place_name, address, latitude, longitude, cuisine_types);

    const text = `
        INSERT INTO reviews (user_id, location_id, food_rating, atmosphere_rating, worth_it_rating, amount_spent, tags, remarks, image_urls)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;

    const values = [userId, mapbox_id, food_rating, atmosphere_rating, worth_it_rating, amount_spent ?? null, tags ?? null, remarks ?? null, image_urls ?? null];
    const { rows } = await query(text, values);
    return rows[0];
}

export async function getReviewById(reviewId) {
    const text = `SELECT * FROM reviews WHERE id = $1`;
    const values = [reviewId];
    const { rows } = await query(text, values);
    return rows[0];
}

export async function updateReview(reviewId, food_rating, atmosphere_rating, worth_it_rating, amount_spent, tags, remarks, image_urls) {
    const text = `
        UPDATE reviews
        SET food_rating = COALESCE($1, food_rating),
            atmosphere_rating = COALESCE($2, atmosphere_rating),
            worth_it_rating = COALESCE($3, worth_it_rating),
            amount_spent = COALESCE($4, amount_spent),
            tags = COALESCE($5, tags),
            remarks = COALESCE($6, remarks),
            image_urls = COALESCE($7, image_urls),
            updated_at = NOW()
        WHERE id = $8
        RETURNING *
    `;
    const values = [food_rating ?? null, atmosphere_rating ?? null, worth_it_rating ?? null, amount_spent ?? null, tags ?? null, remarks ?? null, image_urls ?? null, reviewId];
    const { rows } = await query(text, values);
    return rows[0];
}

export async function deleteReview(reviewId) {
    const text = `
        DELETE FROM reviews
        WHERE id = $1
    `;
    const values = [reviewId];
    await query(text, values);
}