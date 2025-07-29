const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  registerValidationRules,
  loginValidationRules,
  validate
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', registerValidationRules(), validate, register);
router.post('/login', loginValidationRules(), validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;