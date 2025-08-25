import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Message validation rules
const sendMessageValidation = [
  body('receiver_id')
    .isUUID()
    .withMessage('Invalid receiver ID'),
  
  body('content')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Message content cannot exceed 5000 characters'),
  
  body('message_type')
    .isIn(['text', 'image', 'voice', 'file'])
    .withMessage('Invalid message type'),
  
  handleValidationErrors
];

const editMessageValidation = [
  param('messageId')
    .isUUID()
    .withMessage('Invalid message ID'),
  
  body('content')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content must be between 1 and 5000 characters'),
  
  handleValidationErrors
];

// Search validation
const searchValidation = [
  query('q')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  
  handleValidationErrors
];

// User validation
const blockUserValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID'),
  
  handleValidationErrors
];

export {
  registerValidation,
  loginValidation,
  sendMessageValidation,
  editMessageValidation,
  searchValidation,
  blockUserValidation,
  handleValidationErrors
};