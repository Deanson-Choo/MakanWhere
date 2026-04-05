import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';

export async function updateProfile(req, res, next) {
    try {
        const { username, email, password } = req.body;
        const userId = req.user.id;

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

        // Hash the password only if a new one was provided
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Save the updated user to the database
        const updatedUser = await UserModel.updateUser(userId, username, email, hashedPassword);

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
        next(err); // Sends ANY unexpected error (DB down, JWT secret missing, etc.) to the global error handler
    }
}