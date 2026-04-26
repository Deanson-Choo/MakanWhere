import { body, query, param, validationResult } from 'express-validator';

// This function checks if the "rules" found any issues
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Send to global error handler
        const err = new Error('Validation failed');
        err.statusCode = 400;
        err.details = errors.array();
        return next(err);
    }
    // If no errors, proceed to the controller
    next();
};

export const validateSubmitReview = [
    body('mapbox_id')
        .exists({ checkFalsy: true }).withMessage('Mapbox ID is required')
        .isString().withMessage('Mapbox ID must be a string'),
    body('rating')
        .exists().withMessage('Rating is required')
        .isFloat({ min: 0, max: 5 }).withMessage('Rating must be a number between 0 and 5'),
    body('comment')
        .optional()
        .isString().withMessage('Comment must be a string'),
    body('place_name')
        .exists({ checkFalsy: true }).withMessage('Place name is required')
        .isString().withMessage('Place name must be a string'),
    body('address')
        .exists({ checkFalsy: true }).withMessage('Address is required')
        .isString().withMessage('Address must be a string'),
    body('latitude')
        .exists().withMessage('Latitude is required')
        .isFloat().withMessage('Latitude must be a valid number'),
    body('longitude')
        .exists().withMessage('Longitude is required')
        .isFloat().withMessage('Longitude must be a valid number'),
    body('image')
        .optional()
        .isString().withMessage('Image must be a string'),
    validateRequest
];

export const validateUpdateReview = [
    param('id')
        .isInt().withMessage('Review ID must be an integer'),

    body('rating')
        .exists().withMessage('Rating is required').bail()
        .isFloat({ min: 0, max: 5 }).withMessage('Rating must be a number between 0 and 5').bail(),
    body('comment')
        .optional()
        .isString().withMessage('Comment must be a string'),
    validateRequest
    
];

export const validateDeleteReview = [
    param('id')
        .isInt().withMessage('Review ID must be an integer'),
    validateRequest
];

export const validateGetReviews = [
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'rating']).withMessage('Sort must be one of: createdAt, rating'),
    query('order')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Order must be one of: asc, desc'),
    validateRequest
]

export const validateGetReviewsByLocation = [
    param('mapbox_id')
        .isString().withMessage('Mapbox ID must be a string'),
    validateRequest
]
