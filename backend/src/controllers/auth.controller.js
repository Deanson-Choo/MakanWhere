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
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // TODO: JWT Refresh Token 

        const data = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        }

        res.status(201).json({
            success: true,
            data,
            token
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
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // TODO: JWT Refresh Token

        const data = {
            id: user.id,
            username: user.username,
            email: user.email
        }

        res.status(200).json({
            success: true,
            data,
            token
        });
    } catch (err) {
        next(err); 
    }
}
