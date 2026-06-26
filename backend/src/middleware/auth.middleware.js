import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user.model.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Invalid or missing JWT token');
      err.statusCode = 401;
      return next(err);
    }

    const token = authHeader.split(' ')[1]; // Grab access token from "Bearer <token>"

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findUserById(decoded.id);
    if (!user) {
      const err = new Error('User no longer exists');
      err.statusCode = 401;
      return next(err);
    }

    // Strip sensitive fields before attaching to req.user
    const { password, refresh_token, ...safeUser } = user;
    req.user = safeUser;
    next();

  } catch (err) {
    // This will prompt /refresh on the frontend
    err.statusCode = 401;
    next(err);
  }
}
