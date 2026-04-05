import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerValidator, loginValidator, updateProfileValidator } from '../validator/auth.validator.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

// Route -> Validator -> Controller
authRouter.post('/register', registerValidator, authController.register);
authRouter.post('/login', loginValidator, authController.login);

authRouter.put('/profile', authMiddleware, updateProfileValidator, authController.updateProfile);

export default authRouter;
