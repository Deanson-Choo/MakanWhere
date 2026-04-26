import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as validator from '../validator/auth.validator.js';

const authRouter = express.Router();

// Route -> Validator -> Controller
authRouter.post('/register', validator.registerValidator, authController.register);
authRouter.post('/login', validator.loginValidator, authController.login);

export default authRouter;
