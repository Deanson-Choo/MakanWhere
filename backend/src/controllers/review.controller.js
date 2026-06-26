import * as ReviewModel from "../models/review.model.js";
import cloudinary from "../lib/cloudinary.js";

const DATA_IMAGE_PREFIX = 'data:image/';
const CLOUDINARY_HOST = 'res.cloudinary.com';

function isBase64Image(value) {
    return typeof value === 'string'
        && value.startsWith(DATA_IMAGE_PREFIX)
        && value.includes(';base64,');
}

function isCloudinaryImageUrl(value) {
    if (typeof value !== 'string') return false;

    try {
        const parsed = new URL(value);
        return parsed.protocol === 'https:' && parsed.hostname === CLOUDINARY_HOST;
    } catch {
        return false;
    }
}

function extractCloudinaryPublicId(url) {
    // Example URL: https://res.cloudinary.com/dcoc1hedc/image/upload/v1782285796/reccome/21312312fds.jpg
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' || parsed.hostname !== CLOUDINARY_HOST) {
            return null;
        }

        const path = parsed.pathname;
        const uploadMarker = '/upload/';
        const uploadIndex = path.indexOf(uploadMarker);
        if (uploadIndex === -1) {
            return null;
        }

        let publicId = path.slice(uploadIndex + uploadMarker.length);
        publicId = publicId.replace(/^v\d+\//, '');
        publicId = publicId.replace(/\.[^/.]+$/, '');

        return publicId || null;
    } catch {
        return null;
    }
}

// Normalize and upload base64 images to Cloudinary, return array of cloudinary URLs. If the input is already a cloudinary URL, it will be returned as-is.
async function normalizeImageUrls(rawImageUrls) {
    if (!Array.isArray(rawImageUrls)) {
        const err = new Error('image_urls must be an array');
        err.statusCode = 400;
        throw err;
    }

    return Promise.all(
        rawImageUrls.map(async (img) => {
            if (typeof img !== 'string') {
                const err = new Error('Each base64 image must be a string');
                err.statusCode = 400;
                throw err;
            }

            const normalizedImg = img.trim();
            if (!normalizedImg) {
                const err = new Error('Base64 image string cannot be empty');
                err.statusCode = 400;
                throw err;
            }

            if (isBase64Image(normalizedImg)) {
                const uploadResponse = await cloudinary.uploader.upload(normalizedImg, { folder: 'reccome' });
                return uploadResponse.secure_url;
            }

            if (isCloudinaryImageUrl(normalizedImg)) {
                return normalizedImg;
            }

            const err = new Error('Image must be a base64 data URL or a valid Cloudinary URL');
            err.statusCode = 400;
            throw err;
        })
    );
}

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
        const { food_rating, atmosphere_rating, worth_it_rating, meal_type, amount_spent, tags, remarks, image_urls: rawImageUrls } = req.body;

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

        // Build updates object with only explicitly provided fields
        const updates = {};
        if (food_rating !== undefined) updates.food_rating = food_rating;
        if (atmosphere_rating !== undefined) updates.atmosphere_rating = atmosphere_rating;
        if (worth_it_rating !== undefined) updates.worth_it_rating = worth_it_rating;
        if (meal_type !== undefined) updates.meal_type = meal_type;
        if (amount_spent !== undefined) updates.amount_spent = amount_spent;
        if (tags !== undefined) updates.tags = tags;
        if (remarks !== undefined) updates.remarks = remarks;

        // Only process images if the client explicitly sent image_urls
        if (rawImageUrls !== undefined) {
            // Delete removed images from Cloudinary
            const existingImageUrls = review.image_urls || [];
            const urlsToDelete = existingImageUrls.filter(url => !rawImageUrls.includes(url));
            if (urlsToDelete.length > 0) {
                (async () => {
                    try {
                        await Promise.all(
                            urlsToDelete.map((url) => {
                                const publicId = extractCloudinaryPublicId(url);
                                if (!publicId) return null;
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
                updates.image_urls = await normalizeImageUrls(rawImageUrls);
            } else {
                updates.image_urls = null;
            }
        }

        if (Object.keys(updates).length === 0) {
            const err = new Error('At least one field must be provided for update');
            err.statusCode = 400;
            return next(err);
        }

        const updatedReview = await ReviewModel.updateReview(id, updates);
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
                            const publicId = extractCloudinaryPublicId(url);
                            if (!publicId) return null;
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
        const { food_rating, atmosphere_rating, worth_it_rating, meal_type, amount_spent, tags, remarks, image_urls: rawImageUrls } = review;

        let image_urls = [];
        // rawImageUrls can either be an array of new base64 images, or existing cloudinary URLs
        if (rawImageUrls && rawImageUrls.length > 0) {
            image_urls = await normalizeImageUrls(rawImageUrls);
        }
        const createdReview = await ReviewModel.createReview(
            userId, mapbox_id, place_name, address, latitude, longitude, cuisine_types,
            food_rating, atmosphere_rating, worth_it_rating, meal_type, amount_spent, tags, remarks,
            image_urls.length ? image_urls : null
        );
        res.status(201).json({ success: true, data: createdReview });
    } catch (error) {
        next(error);
    }
}
