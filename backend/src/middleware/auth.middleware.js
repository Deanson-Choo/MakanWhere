import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user.model.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Invalid or missing token');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await UserModel.findUserById(decoded.id);
  if (!user) {
    const err = new Error('User no longer exists');
    err.statusCode = 401;
    return next(err);
  }

  req.user = user;
  next();
}

