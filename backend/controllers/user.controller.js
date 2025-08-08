const User = require('../models/User.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
const updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { name, email, username } = req.body;

  // Check if email is already taken by another user
  if (email && email !== req.user.email) {
    const emailExists = await User.emailExists(email, userId);
    if (emailExists) {
      return next(new AppError('Email is already in use', 400));
    }
  }

  // Check if username is already taken by another user
  if (username && username !== req.user.username) {
    const usernameExists = await User.usernameExists(username, userId);
    if (usernameExists) {
      return next(new AppError('Username is already taken', 400));
    }
  }

  // Update user
  const updated = await User.update(userId, { name, email, username });
  
  if (!updated) {
    return next(new AppError('Failed to update profile', 400));
  }

  // Get updated user data
  const updatedUser = await User.findById(userId);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  });
});

// @desc    Update password
// @route   PUT /api/users/update-password
// @access  Private
const updatePassword = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters', 400));
  }

  try {
    await User.updatePassword(userId, currentPassword, newPassword);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return next(new AppError(error.message, 401));
    }
    throw error;
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
});

module.exports = {
  updateProfile,
  updatePassword,
  getProfile
};