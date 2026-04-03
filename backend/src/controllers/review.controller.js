import { getReviewsByUserId, createDBReview, getReviewsByLocationIdByUserId, updateDBReview, getOwnerOfReview, deleteDBReview} from "../models/review.model.js";
import cloudinary from "../lib/cloudinary.js";

export async function getReviewsByUser(req, res, next) {
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order || 'desc';
    try { 
        const userId = req.user.id;
        const reviews = await getReviewsByUserId(userId, sortBy, order);
        res.status(200).json({
            success: true,
            data: reviews
        })
    } catch (error) {
        next(error);
    }
}

export async function getReviewsByUserByLocation(req, res, next) {
    // By right, there is only one review
    try {
        const userId = req.user.id;
        const { mapbox_id } = req.params;
        const reviews = await getReviewsByLocationIdByUserId(userId, mapbox_id);
        res.status(200).json({
            success: true,
            data: reviews
        })
    } catch (error) {
        next(error);
    }   
}

export async function updateReview(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { rating, comment } = req.body;

        // Check if the review belongs to the user
        const ownerId = await getOwnerOfReview(id);
        if (ownerId !== userId) {
            const err = new Error('Unauthorized: You can only update your own reviews');
            err.statusCode = 403;
            return next(err);
        }

        const updatedReview = await updateDBReview(id, rating, comment);
        res.status(200).json({
            success: true,
            data: updatedReview
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteReview(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params
        
        // Check if the review belongs to the user
        const ownerId = await getOwnerOfReview(id);
        if (ownerId != userId) {
            const err = new Error('Unauthorized: You can only update your own reviews');
            err.statusCode = 403;
            return next(err);
        }

        const deletedReview = await deleteDBReview(id)
        res.status(200).json({
            success: true,
            data: deletedReview
        })
    } catch(error) {
        next(error);
    }
}

export async function createReview(req, res, next) {
    try {
        const userId = req.user.id;
        const { mapbox_id, rating, comment, place_name, address, latitude, longitude, image } = req.body;

        let imageUrl = null;
        if (image) {
            // Upload image to Cloudinary 
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: 'makanwhere',
            });
            imageUrl = uploadResponse.secure_url;
        }

        const review = await createDBReview(userId, mapbox_id, rating, comment, place_name, address, latitude, longitude, imageUrl);
        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
}

