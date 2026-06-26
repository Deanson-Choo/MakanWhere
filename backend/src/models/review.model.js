import { query } from '../lib/db.js';
import { upsertLocation } from './location.model.js';

export async function getReviews(userId, sortBy = 'last_visited', sortOrder = 'DESC') {
    const allowedSortColumns = ['last_visited', 'avg_rating', 'l.place_name']; // Add your actual allowed columns
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'last_visited'; 
    const safeSortOrder = (sortOrder && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const text = `
        WITH AR AS (
            SELECT location_id,
                   -- Fixed integer division by using 3.0
                   AVG((food_rating + atmosphere_rating + worth_it_rating) / 3.0) AS avg_rating
            FROM reviews
            GROUP BY location_id
        )
        SELECT
            l.mapbox_id, l.place_name, l.address, l.latitude, l.longitude, l.cuisine_types,
            MAX(r.created_at) AS last_visited,
            ar.avg_rating,
            json_agg(
                json_build_object(
                    'id',                r.id,
                    'food_rating',       r.food_rating,
                    'atmosphere_rating', r.atmosphere_rating,
                    'worth_it_rating',   r.worth_it_rating,
                    'meal_type',         r.meal_type,
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
        LEFT JOIN AR ar ON l.mapbox_id = ar.location_id
        WHERE r.user_id = $1
        -- Added ar.avg_rating to GROUP BY to prevent PostgreSQL errors
        GROUP BY l.mapbox_id, ar.avg_rating
        ORDER BY ${safeSortBy} ${safeSortOrder}
    `;
    const values = [userId];
    const { rows } = await query(text, values);
    return rows;
}

export async function createReview(userId, mapbox_id, place_name, address, latitude, longitude, cuisine_types, food_rating, atmosphere_rating, worth_it_rating, meal_type, amount_spent, tags, remarks, image_urls) {
    // Ensure the location exists in the database (insert if not exists)
    await upsertLocation(mapbox_id, place_name, address, latitude, longitude, cuisine_types);

    const text = `
        INSERT INTO reviews (user_id, location_id, food_rating, atmosphere_rating, worth_it_rating, meal_type, amount_spent, tags, remarks, image_urls)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;

    const values = [userId, mapbox_id, food_rating, atmosphere_rating, worth_it_rating, meal_type ?? null, amount_spent ?? null, tags ?? null, remarks ?? null, image_urls ?? null];
    const { rows } = await query(text, values);
    return rows[0];
}

export async function getReviewById(reviewId) {
    const text = `SELECT * FROM reviews WHERE id = $1`;
    const values = [reviewId];
    const { rows } = await query(text, values);
    return rows[0];
}

export async function updateReview(reviewId, updates) {
    const allowedFields = new Set(['food_rating', 'atmosphere_rating', 'worth_it_rating', 'meal_type', 'amount_spent', 'tags', 'remarks', 'image_urls']);

    const fields = Object.keys(updates).filter(f => allowedFields.has(f));
    const setClauses = [
        ...fields.map((f, i) => `${f} = $${i + 1}`),
        'updated_at = NOW()'
    ];
    const values = [...fields.map(f => updates[f]), reviewId];

    const text = `
        UPDATE reviews
        SET ${setClauses.join(', ')}
        WHERE id = $${fields.length + 1}
        RETURNING *
    `;
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

export async function getImageUrls(userId) {
    const text = `
        SELECT r.image_urls
        FROM reviews r
        WHERE r.user_id = $1
    `
    const values = [userId]
    const { rows } = await query(text,values);
    return rows.flatMap(row => row.image_urls || []);
}