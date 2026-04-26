import express from 'express'
import * as reviewController from '../controllers/review.controller.js';
import * as validator from '../validator/review.validator.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const reviewRouter = express.Router();

reviewRouter.route('/')
    .get(authMiddleware, validator.validateGetReviews, reviewController.getReviews) // Get all reviews for the authenticated user
    .post(authMiddleware, validator.validateSubmitReview, reviewController.createReview); // Create a new review for the authenticated user

reviewRouter.route('/:id')
    .put(authMiddleware, validator.validateUpdateReview, reviewController.updateReview) // Update a review by ID for the authenticated user
    .delete(authMiddleware, validator.validateDeleteReview, reviewController.deleteReview); // Delete a review by ID for the authenticated user

reviewRouter.get('/location/:mapbox_id', authMiddleware, validator.validateGetReviewsByLocation, reviewController.getReviewsByLocation); // Get review for a specific location for the authenticated user

export default reviewRouter;