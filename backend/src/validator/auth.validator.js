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
        return next(err);
    }
    // If no errors, proceed to the controller
    next();
};

/* Requirements for Database
- Username (text): Required, at least 3 characters, must be unique
- Email (text): Required, must be a valid email format, must be unique
- Password (text): Required, at least 6 characters
*/


// Validation rules for the registration endpoint
export const registerValidator = [
  body('username')
    .trim().notEmpty().withMessage('Username is required').bail()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters').bail(),

  body('email')
    .trim().notEmpty().withMessage('Email is required').bail()
    .isEmail().withMessage('Email format is invalid').bail()
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required').bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters').bail(),

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

