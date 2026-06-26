import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as validator from '../validator/auth.validator.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', validator.registerValidator, authController.register);
authRouter.post('/login', validator.loginValidator, authController.login);
authRouter.post('/logout', authMiddleware, authController.logout);
authRouter.post('/refresh', authController.refresh);

// TODO: Add password reset route


export default authRouter;
