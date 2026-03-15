import express from 'express'
import * as reviewController from '../controllers/review.controller.js';
import { submitValidator } from '../validator/review.validator.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const reviewRouter = express.Router();

reviewRouter.get('/', authMiddleware, reviewController.getReviews);
reviewRouter.post('/', authMiddleware, submitValidator, reviewController.createReview);
// reviewRouter.put('/:id', updateValidator, authMiddleware, reviewController.updateReview);
// reviewRouter.delete('/:id', authMiddleware, reviewController.deleteReview);

export default reviewRouter;