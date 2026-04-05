import express from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { updateProfileValidator } from '../validator/profile.validator.js';

const profileRouter = express.Router();

profileRouter.put('/profile', authMiddleware, updateProfileValidator, profileController.updateProfile);

// TODO: Implement deletion of a profile
//profileRouter.delete('/profile', authMiddleware, profileController.deleteProfile);

export default profileRouter;