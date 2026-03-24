import { body, query, validationResult } from 'express-validator';

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

export const submitValidator = [
    body('rating')
        .isFloat({ min: 0, max: 5 }).withMessage('Rating must be a number between 0 and 5'),
    validateRequest
];

export const updateValidator = [
    body('rating')
        .isFloat({ min: 0, max: 5 }).withMessage('Rating must be a number between 0 and 5'),
    validateRequest
]

export const getValidator = [
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'rating']).withMessage('Sort must be one of: createdAt, rating'),
    query('order')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Order must be one of: asc, desc'),
    validateRequest
]
