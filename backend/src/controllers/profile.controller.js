import * as UserModel from '../models/user.model.js';
import { getImageUrls } from '../models/review.model.js';
import cloudinary from '../lib/cloudinary.js';

const CLOUDINARY_HOST = 'res.cloudinary.com';

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

export async function updateProfile(req, res, next) {
    try {
        const { username, email } = req.body;
        const userId = req.user.id;

        if (!username && !email) {
            const err = new Error('At least one field (username or email) must be provided for update');
            err.statusCode = 400;
            return next(err);
        }

        // Check if the email is already registered to another user
        if (email) {
            const user = await UserModel.findUserByEmail(email);
            if (user && user.id !== userId) {
                const err = new Error('Email is already registered');
                err.statusCode = 409;
                return next(err);
            }
        }

        // Check if the username is already taken
        if (username) {
            const user = await UserModel.findUserByUsername(username);
            if (user && user.id !== userId) {
                const err = new Error('Username is already taken');
                err.statusCode = 409;
                return next(err);
            }
        }

        // Save the updated user to the database
        const updatedUser = await UserModel.updateUser(userId, username, email, null);

        const data = {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        next(err); 
    }
}

export async function deleteProfile(req, res, next) {
    try {
        const userId = req.user.id;

        const image_urls = await getImageUrls(userId);

        // 1. Delete profile
        await UserModel.deleteUser(userId);

        // 2. Best-effort: delete images from Cloudinary after DB record is gone
        if (image_urls && image_urls.length > 0) {
            (async () => {
                try {
                    await Promise.all(
                        image_urls.map((url) => {
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

        res.status(200).json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
}