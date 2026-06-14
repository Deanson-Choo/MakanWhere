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

export const createReviewValidator = [
    body('location.mapbox_id')
        .notEmpty().withMessage('mapbox_id is required').bail()
        .isString().withMessage('mapbox_id must be a string'),
    body('location.place_name')
        .notEmpty().withMessage('place_name is required').bail()
        .isString().withMessage('place_name must be a string'),
    body('location.address')
        .notEmpty().withMessage('address is required').bail()
        .isString().withMessage('address must be a string'),
    body('location.latitude')
        .notEmpty().withMessage('latitude is required').bail()
        .isFloat().withMessage('latitude must be a number'),
    body('location.longitude')
        .notEmpty().withMessage('longitude is required').bail()
        .isFloat().withMessage('longitude must be a number'),
    body('location.cuisine_types')
        .optional()
        .isArray().withMessage('cuisine_types must be an array')
        .custom((arr) => arr.every((t) => typeof t === 'string')).withMessage('each cuisine type must be a string'),

    body('review.food_rating')
        .notEmpty().withMessage('food_rating is required').bail()
        .isInt({ min: 1, max: 5 }).withMessage('food_rating must be an integer between 1 and 5'),
    body('review.atmosphere_rating')
        .notEmpty().withMessage('atmosphere_rating is required').bail()
        .isInt({ min: 1, max: 5 }).withMessage('atmosphere_rating must be an integer between 1 and 5'),
    body('review.worth_it_rating')
        .notEmpty().withMessage('worth_it_rating is required').bail()
        .isInt({ min: 1, max: 5 }).withMessage('worth_it_rating must be an integer between 1 and 5'),
    body('review.amount_spent')
        .optional()
        .isIn(['1-10', '10-20', '20-30', '30-40', '40-50', '>50'])
        .withMessage('amount_spent must be one of: 1-10, 10-20, 20-30, 30-40, 40-50, >50'),
    body('review.tags')
        .optional()
        .isArray().withMessage('tags must be an array')
        .custom((arr) => arr.every((t) => typeof t === 'string')).withMessage('each tag must be a string'),
    body('review.remarks')
        .optional()
        .isString().withMessage('remarks must be a string'),
    body('review.image_urls')
        .optional()
        .isArray().withMessage('image_urls must be an array')
        .custom((arr) => arr.every((u) => typeof u === 'string')).withMessage('each image URL must be a string'),

    validateRequest
];

export const updateReviewValidator = [
    param('id')
        .isInt().withMessage('Review ID must be an integer'),

    body('food_rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('food_rating must be an integer between 1 and 5'),
    body('atmosphere_rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('atmosphere_rating must be an integer between 1 and 5'),
    body('worth_it_rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('worth_it_rating must be an integer between 1 and 5'),
    body('amount_spent')
        .optional()
        .isIn(['1-10', '10-20', '20-30', '30-40', '40-50', '>50'])
        .withMessage('amount_spent must be one of: 1-10, 10-20, 20-30, 30-40, 40-50, >50'),
    body('tags') // By right, there are fixed tags, but user can customize it in the future
        .optional()
        .isArray().withMessage('tags must be an array')
        .custom((arr) => arr.every((t) => typeof t === 'string')).withMessage('each tag must be a string'),
    body('remarks')
        .optional()
        .isString().withMessage('remarks must be a string'),
    body('image_urls')
        .optional()
        .isArray().withMessage('image_urls must be an array')
        .custom((arr) => arr.every((u) => typeof u === 'string')).withMessage('each image URL must be a string'),

    validateRequest  
];

export const deleteReviewValidator = [
    param('id')
        .isInt().withMessage('Review ID must be an integer'),

    validateRequest
];


