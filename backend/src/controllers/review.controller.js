import * as ReviewModel from "../models/review.model.js";
import cloudinary from "../lib/cloudinary.js";

export async function getReviews(req, res, next) {
    const sortBy = req.query.sortBy 
    const order = req.query.order 
    try { 
        const userId = req.user.id;
        const reviews = await ReviewModel.getReviews(userId, sortBy, order);
        res.status(200).json({
            success: true,
            data: reviews
        })
    } catch (error) {
        next(error);
    }
}

export async function getReviewsByLocation(req, res, next) {
    // By right, there is only one review
    try {
        const userId = req.user.id;
        const { mapbox_id } = req.params;
        const reviews = await ReviewModel.getReviewsByLocation(userId, mapbox_id);
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
        let { rating, comment } = req.body;

        comment = comment ? comment : ""; // Set comment to empty string if it's undefined or null
        // Check if the review belongs to the user
        const review = await ReviewModel.getReviewById(id);
        if (!review) {
            const err = new Error('Review not found');
            err.statusCode = 404;
            return next(err);
        }
        if (review.userId !== userId) {
            const err = new Error('Unauthorized: You can only update your own reviews');
            err.statusCode = 403;
            return next(err);
        }

        const updatedReview = await ReviewModel.updateReview(id, rating, comment);
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
        const review = await ReviewModel.getReviewById(id);
        if (!review) {
            const err = new Error('Review not found');
            err.statusCode = 404;
            return next(err);
        }
        if (review.userId !== userId) {
            const err = new Error('Unauthorized: You can only delete your own reviews');
            err.statusCode = 403;
            return next(err);
        }

        const publicId = review.image_url ? review.image_url.split('/').slice(-2).join('/').split('.')[0] : null; // Extract public ID from the image URL
        if (publicId) {
            await cloudinary.uploader.destroy(publicId); // Delete the image from Cloudinary
        }

        const deletedReview = await ReviewModel.deleteReview(id)
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
        let { mapbox_id, rating, comment, place_name, address, latitude, longitude, image } = req.body;
        
        comment = comment ? comment : ""; // Set comment to empty string if it's undefined or null
        let imageUrl = null;
        if (image) {
            // Upload image to Cloudinary 
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: 'makanwhere',
            });
            imageUrl = uploadResponse.secure_url;
        }

        const review = await ReviewModel.createReview(userId, mapbox_id, rating, comment, place_name, address, latitude, longitude, imageUrl);
        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
}

