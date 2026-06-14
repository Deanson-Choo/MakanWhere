import * as UserModel from '../models/user.model.js';

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

        await UserModel.deleteUser(userId);

        res.status(200).json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
}