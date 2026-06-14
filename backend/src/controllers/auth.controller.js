import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import * as UserModel from '../models/user.model.js';


export async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;

        if (await UserModel.findUserByEmail(email)) {
            const err = new Error('Email is already registered');
            err.statusCode = 400;
            return next(err);
        }
        
        if (await UserModel.findUserByUsername(username)) {
            const err = new Error('Username is already taken');
            err.statusCode = 400;
            return next(err);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the new user to the database
        const newUser = await UserModel.createUser(username, email, hashedPassword);

        // Generate a JWT token for the user
        const accessToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Generate a JWT refresh token 
        const refreshToken = jwt.sign({ id: newUser.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        const refreshTokenSalt = await bcrypt.genSalt(10);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, refreshTokenSalt);

        // Update the user with the refresh token
        await UserModel.updateUser(newUser.id, null, null, null, hashedRefreshToken);

        const data = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        }

        res.status(201).json({
            success: true,
            data,
            accessToken,
            refreshToken
        });
    } catch (err) {
        next(err); 
    }
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            // Send to global error handler
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            return next(err);
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Send to global error handler
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            return next(err);
        }

        // Generate a JWT token for the user
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Generate a JWT refresh token 
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        const refreshTokenSalt = await bcrypt.genSalt(10);
        const hashedRefreshToken = await bcrypt.hash(refreshToken, refreshTokenSalt);

        // Update the user with the new refresh token
        await UserModel.updateUser(user.id, null, null, null, hashedRefreshToken);

        const data = {
            id: user.id,
            username: user.username,
            email: user.email
        }

        res.status(200).json({
            success: true,
            data,
            accessToken,
            refreshToken
        });
    } catch (err) {
        next(err); 
    }
}

export async function logout(req, res, next) {
    try {
        const userId = req.user.id;

        // Remove the refresh token from the database
        await UserModel.clearRefreshToken(userId);

        res.status(200).json({
            success: true
        });
    } catch (err) {
        next(err);
    }
}


// Remember to prompt user to re-login if token refresh fails (e.g. due to token reuse or tampering)
export async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            const err = new Error('Refresh token is required');
            err.statusCode = 401;
            return next(err);
        }

        // Verify the refresh token signature
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find the user and check stored hashed refresh token
        const user = await UserModel.findUserById(decoded.id);
        if (!user || !user.refresh_token) {
            const err = new Error('Invalid refresh token');
            err.statusCode = 401;
            return next(err);
        }

        // Compare against stored hashed token
        const isMatch = await bcrypt.compare(refreshToken, user.refresh_token);
        if (!isMatch) {
            const err = new Error('Invalid refresh token');
            err.statusCode = 401;
            return next(err);
        }

        // Issue new tokens (rotation)
        const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        const hashedRefreshToken = await bcrypt.hash(newRefreshToken, await bcrypt.genSalt(10));

        await UserModel.updateUser(user.id, null, null, null, hashedRefreshToken);

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        err.statusCode = 401;
        next(err);
    }
}
