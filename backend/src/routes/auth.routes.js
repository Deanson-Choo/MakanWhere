import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerValidator, loginValidator} from '../validator/auth.validator.js';

const authRouter = express.Router();

// Route -> Validator -> Controller
authRouter.post('/register', registerValidator, authController.register);
authRouter.post('/login', loginValidator, authController.login);

export default authRouter;
