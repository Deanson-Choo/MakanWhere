import { body, validationResult } from 'express-validator';

// This function checks if the "rules" found any issues
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Send to global error handler
        const err = new Error('Profile validation failed');
        err.statusCode = 400;
        err.details = errors.array().map(e => ({ field: e.path, message: e.msg }));
        return next(err);
    }
    // If no errors, proceed to the controller
    next();
};

export const updateProfileValidator = [
  body('username')
    .optional()
    .notEmpty().withMessage('Username cannot be empty').bail()
    .isString().withMessage('Username must be a string')
    .trim(),

  body('email')
    .optional()
    .notEmpty().withMessage('Email cannot be empty').bail()
    .isEmail().withMessage('Email format is invalid')
    .normalizeEmail(),

  validateRequest
];