const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updatePassword,
  getProfile
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join('. ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// Validation rules for profile update
const profileUpdateRules = () => {
  return [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
  ];
};

// Validation rules for password update
const passwordUpdateRules = () => {
  return [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage('New password must contain at least one letter and one number')
  ];
};

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', getProfile);
router.put('/update-profile', profileUpdateRules(), validate, updateProfile);
router.put('/update-password', passwordUpdateRules(), validate, updatePassword);

module.exports = router;