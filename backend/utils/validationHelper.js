const AppError = require('./appError');

// Format validation errors into user-friendly messages
const formatValidationErrors = (errors) => {
  const formattedErrors = errors.map(err => {
    switch (err.param) {
      case 'email':
        return 'Please provide a valid email address';
      case 'password':
        return err.msg || 'Password must be at least 6 characters with letters and numbers';
      case 'username':
        return err.msg || 'Username must be 3-30 characters (letters, numbers, underscores only)';
      case 'title':
        return 'Event title is required (3-255 characters)';
      case 'description':
        return 'Event description is required (minimum 10 characters)';
      case 'date_time':
        return 'Please provide a valid future date and time';
      case 'venue_id':
        return 'Please select a valid venue';
      default:
        return err.msg || `Invalid value for ${err.param}`;
    }
  });
  
  return formattedErrors.join('. ');
};

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const message = formatValidationErrors(errors.array());
    return next(new AppError(message, 400));
  }
  
  next();
};

module.exports = {
  formatValidationErrors,
  handleValidationErrors
};