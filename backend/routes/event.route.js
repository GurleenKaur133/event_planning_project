const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents
} = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  createEventValidationRules,
  updateEventValidationRules,
  validate
} = require('../middleware/eventValidation.middleware');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(protect); // All routes after this require authentication

router.get('/user/my-events', getMyEvents); // Must be before /:id to avoid conflict
router.post('/', createEventValidationRules(), validate, createEvent);
router.put('/:id', updateEventValidationRules(), validate, updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;