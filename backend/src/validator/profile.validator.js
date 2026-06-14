import { body, validationResult } from 'express-validator';

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

export const updateProfileValidator = [
  body('username')
    .optional()
    .trim(),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email format is invalid')
    .normalizeEmail(),

  validateRequest
];