import express from 'express'
import * as reviewController from '../controllers/review.controller.js';
import * as validator from '../validator/review.validator.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const reviewRouter = express.Router();

// CRUD operations for reviews
reviewRouter.post('/', authMiddleware, validator.createReviewValidator, reviewController.createReview);
reviewRouter.get('/', authMiddleware, reviewController.getReviews);
reviewRouter.patch('/:id', authMiddleware, validator.updateReviewValidator, reviewController.updateReview);
reviewRouter.delete('/:id', authMiddleware, validator.deleteReviewValidator, reviewController.deleteReview);

export default reviewRouter;