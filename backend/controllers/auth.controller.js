const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = catchAsync(async (req, res, next) => {
  const { username, email, password, name } = req.body;
  
  // Ensure name has a value (use username as fallback if name is not provided)
  const userData = {
    username,
    email,
    password,
    name: name || username  // Use username as name if name is not provided
  };
  
  // Check if user already exists
  const userExistsByEmail = await User.findByEmail(email);
  const userExistsByUsername = await User.findByUsername(username);
  
  if (userExistsByEmail) {
    return next(new AppError('User with this email already exists', 400));
  }
  
  if (userExistsByUsername) {
    return next(new AppError('Username is already taken', 400));
  }
  
  // Create user with userData object
  const userId = await User.create(userData);
  
  // Get created user
  const user = await User.findById(userId);
  
  // Generate token
  const token = generateToken(userId);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  
  // Check if user exists
  const user = await User.findByEmail(email);
  
  if (!user || !(await User.comparePassword(password, user.password))) {
    return next(new AppError('Invalid credentials', 401));
  }
  
  // Generate token
  const token = generateToken(user.id);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = catchAsync(async (req, res, next) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout
};