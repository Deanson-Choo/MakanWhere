import * as ReviewModel from "../models/review.model.js";
import cloudinary from "../lib/cloudinary.js";

export async function getReviews(req, res, next) {
    try { 
        const userId = req.user.id;
        const reviews = await ReviewModel.getReviews(userId);
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
        const { food_rating, atmosphere_rating, worth_it_rating, amount_spent, tags, remarks, image_urls: rawImageUrls } = req.body;

        const review = await ReviewModel.getReviewById(id);
        if (!review) {
            const err = new Error('Review not found');
            err.statusCode = 404;
            return next(err);
        }
        if (review.user_id !== userId) {
            const err = new Error('Unauthorized: You can only update your own reviews');
            err.statusCode = 403;
            return next(err);
        }

        // Only process images if the client explicitly sent image_urls
        let image_urls = undefined;
        if (rawImageUrls !== undefined) {
            // Delete removed images from Cloudinary
            const existingImageUrls = review.image_urls || [];
            const urlsToDelete = existingImageUrls.filter(url => !rawImageUrls.includes(url));
            if (urlsToDelete.length > 0) {
                (async () => {
                    try {
                        await Promise.all(
                            urlsToDelete.map((url) => {
                                const publicId = url.split('/').slice(-2).join('/').split('.')[0];
                                return cloudinary.uploader.destroy(publicId);
                            })
                        );
                    } catch (err) {
                        // TODO: Create a logs table in the future
                        console.error('Cloudinary cleanup failed:', err);
                    }
                })();
            }

            // Upload new base64 images, keep existing Cloudinary URLs as-is
            if (rawImageUrls.length > 0) {
                image_urls = await Promise.all(
                    rawImageUrls.map(async (img) => {
                        if (img.startsWith('data:')) {
                            const uploadResponse = await cloudinary.uploader.upload(img, { folder: 'reccome' });
                            return uploadResponse.secure_url;
                        }
                        return img;
                    })
                );
            } else {
                image_urls = null;
            }
        }

        const updatedReview = await ReviewModel.updateReview(
            id, food_rating, atmosphere_rating, worth_it_rating, amount_spent, tags, remarks,
            image_urls
        );
        res.status(200).json({ success: true, data: updatedReview });
    } catch (error) {
        next(error);
    }
}

export async function deleteReview(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const review = await ReviewModel.getReviewById(id);
        if (!review) {
            const err = new Error('Review not found');
            err.statusCode = 404;
            return next(err);
        }
        if (review.user_id !== userId) {
            const err = new Error('Unauthorized: You can only delete your own reviews');
            err.statusCode = 403;
            return next(err);
        }
        
        // Delete the review from the database first 
        await ReviewModel.deleteReview(id);

        // Best-effort: delete images from Cloudinary after DB record is gone
        if (review.image_urls && review.image_urls.length > 0) {
            (async () => {
                try {
                    await Promise.all(
                        review.image_urls.map((url) => {
                            const publicId = url.split('/').slice(-2).join('/').split('.')[0];
                            return cloudinary.uploader.destroy(publicId);
                        })
                    );
                } catch (err) {
                    //TODO: Create a logs table in the future 
                    console.error('Cloudinary cleanup failed:', err);
                }
            })();
        }
        res.status(200).json({ success: true, data: null });
    } catch(error) {
        next(error);
    }
}

export async function createReview(req, res, next) {
    try {
        const userId = req.user.id;
        const { location, review } = req.body;
        const { mapbox_id, place_name, address, latitude, longitude, cuisine_types } = location;
        const { food_rating, atmosphere_rating, worth_it_rating, amount_spent, tags, remarks, image_urls: rawImageUrls } = review;

        let image_urls = [];
        // rawImageUrls can either be an array of new base64 images, or existing cloudinary URLs
        if (rawImageUrls && rawImageUrls.length > 0) {
            image_urls = await Promise.all(
                rawImageUrls.map(async (img) => {
                    // Only upload if it's a new base64 image, otherwise keep the existing URL
                    if (img.startsWith('data:')) {
                        const uploadResponse = await cloudinary.uploader.upload(img, { folder: 'reccome' });
                        return uploadResponse.secure_url;
                    }
                    return img;
                })
            );
        }

        const createdReview = await ReviewModel.createReview(
            userId, mapbox_id, place_name, address, latitude, longitude, cuisine_types,
            food_rating, atmosphere_rating, worth_it_rating, amount_spent, tags, remarks,
            image_urls.length ? image_urls : null
        );
        res.status(201).json({ success: true, data: createdReview });
    } catch (error) {
        next(error);
    }
}
