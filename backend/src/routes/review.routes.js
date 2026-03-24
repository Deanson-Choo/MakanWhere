import express from 'express'
import * as reviewController from '../controllers/review.controller.js';
import { getValidator, submitValidator, updateValidator } from '../validator/review.validator.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const reviewRouter = express.Router();

reviewRouter.get('/user', authMiddleware, getValidator, reviewController.getReviewsByUser);
reviewRouter.get('/user/location/:mapbox_id', authMiddleware, reviewController.getReviewsByUserByLocation);
reviewRouter.post('/user', authMiddleware, submitValidator, reviewController.createReview);
reviewRouter.put('/:id', authMiddleware, updateValidator, reviewController.updateReview);
reviewRouter.delete('/:id', authMiddleware, reviewController.deleteReview);

export default reviewRouter;