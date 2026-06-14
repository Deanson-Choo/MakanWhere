import { body, validationResult } from 'express-validator';

// This function checks if the "rules" found any issues
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // Send to global error handler
        const err = new Error('Validation failed');
        err.statusCode = 400;
        err.details = errors.array().map(e => ({
            field: e.path,
            message: e.msg
        }));
        // Error looks like this:
        // {
        // "field": "email",
        // "message": "Email format is invalid"
        // }
        return next(err);
    }
    // If no errors, proceed to the controller
    next();
};


// Validation rules for the registration endpoint
export const registerValidator = [
  body('username')
    .trim().notEmpty().withMessage('Username is required').bail(),

  body('email')
    .trim().notEmpty().withMessage('Email is required').bail()
    .isEmail().withMessage('Email format is invalid').bail()
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required').bail(),

  validateRequest
];

// Validation rules for the login endpoint
export const loginValidator = [
  body('email')
    .trim().notEmpty().withMessage('Email is required').bail()
    .isEmail().withMessage('Email format is invalid').bail()
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required').bail(),

  validateRequest
];

