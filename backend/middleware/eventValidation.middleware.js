const { body, validationResult } = require('express-validator');

// Validation rules for creating event
const createEventValidationRules = () => {
  return [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('date_time')
      .notEmpty().withMessage('Date and time are required')
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Event date must be in the future');
        }
        return true;
      }),
    body('venue_id')
      .notEmpty().withMessage('Venue is required')
      .isInt().withMessage('Invalid venue ID'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'cancelled', 'completed']).withMessage('Invalid status')
  ];
};

// Validation rules for updating event
const updateEventValidationRules = () => {
  return [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('date_time')
      .optional()
      .isISO8601().withMessage('Invalid date format')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Event date must be in the future');
        }
        return true;
      }),
    body('venue_id')
      .optional()
      .isInt().withMessage('Invalid venue ID'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'cancelled', 'completed']).withMessage('Invalid status')
  ];
};

// Validation middleware
// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path || err.param,  // Updated this line
        message: err.msg
      }))
    });
  }
  next();
};
module.exports = {
  createEventValidationRules,
  updateEventValidationRules,
  validate
};