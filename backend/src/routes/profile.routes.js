import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as validator from '../validator/profile.validator.js';

const profileRouter = express.Router();

profileRouter.patch('/', authMiddleware, validator.updateProfileValidator, profileController.updateProfile);
profileRouter.delete('/', authMiddleware, profileController.deleteProfile);

export default profileRouter;