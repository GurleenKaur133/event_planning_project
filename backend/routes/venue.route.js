const express = require('express');
const router = express.Router();
const {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} = require('../controllers/venue.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules
const venueValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('location')
      .trim()
      .notEmpty().withMessage('Location is required')
      .isLength({ min: 5, max: 255 }).withMessage('Location must be between 5 and 255 characters'),
    body('capacity')
      .notEmpty().withMessage('Capacity is required')
      .isInt({ min: 1, max: 100000 }).withMessage('Capacity must be between 1 and 100,000')
  ];
};

// Public routes
router.get('/', getAllVenues);
router.get('/:id', getVenueById);

// Protected routes
router.use(protect); // All routes after this require authentication

router.post('/', venueValidationRules(), validate, createVenue);
router.put('/:id', venueValidationRules(), validate, updateVenue);
router.delete('/:id', deleteVenue);

module.exports = router;