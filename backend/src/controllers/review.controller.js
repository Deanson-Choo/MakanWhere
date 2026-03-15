import { getReviewsByUserId, createDBReview } from "../models/review.model.js";

export async function getReviews(req, res, next) {
    try {
        const userId = req.user.id;
        const reviews = await getReviewsByUserId(userId);
        res.status(200).json({
            success: true,
            data: reviews
        })
    } catch (error) {
        next(error);
    }
}

export async function createReview(req, res, next) {
    try {
        const userId = req.user.id;
        const { mapbox_id, rating, comment, place_name, address, latitude, longitude } = req.body;
        const review = await createDBReview(userId, mapbox_id, rating, comment, place_name, address, latitude, longitude);
        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
}

