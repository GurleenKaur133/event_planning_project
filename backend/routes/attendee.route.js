const express = require('express');
const router = express.Router();
const {
  rsvpToEvent,
  getEventAttendees,
  getMyRsvps,
  getRsvpStatus,
  cancelRsvp
} = require('../controllers/attendee.controller');
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

// RSVP validation rules
const rsvpValidationRules = () => {
  return [
    body('event_id')
      .notEmpty().withMessage('Event ID is required')
      .isInt().withMessage('Invalid event ID'),
    body('rsvp_status')
      .optional()
      .isIn(['yes', 'no', 'maybe', 'waitlist']).withMessage('Invalid RSVP status')
  ];
};

// Public routes
router.get('/event/:eventId', getEventAttendees);

// Protected routes
router.use(protect); // All routes after this require authentication

router.post('/rsvp', rsvpValidationRules(), validate, rsvpToEvent);
router.get('/my-rsvps', getMyRsvps);
router.get('/status/:eventId', getRsvpStatus);
router.delete('/cancel/:eventId', cancelRsvp);

module.exports = router;
