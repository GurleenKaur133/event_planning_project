const express = require('express');
const cors = require('cors');
require('dotenv').config();
const AppError = require('./utils/appError');
const errorHandler = require('./middleware/errorHandler.middleware');
const logger = require('./middleware/logger.middleware');
const { generalLimiter, authLimiter, createLimiter } = require('./middleware/rateLimiter.middleware');
const setupSecurity = require('./middleware/security.middleware');

const app = express();
const PORT = 8080;

// Security middleware
setupSecurity(app);

// General middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(logger);
}

// Rate limiting
app.use('/api', generalLimiter);

// DB connection
require('./config/db');

// Routes
const testRoute = require('./routes/test.route');
const authRoute = require('./routes/auth.route');
const eventRoute = require('./routes/event.route');
const venueRoute = require('./routes/venue.route');
const attendeeRoute = require('./routes/attendee.route');
const userRoute = require('./routes/user.route');

app.use('/api', testRoute);
app.use('/api/auth', authLimiter, authRoute); // Apply auth limiter
app.use('/api/events', eventRoute);
app.use('/api/venues', venueRoute);
app.use('/api/attendees', attendeeRoute);
app.use('/api/users', userRoute);


app.get('/', (req, res) => {
  res.send("Backend API is running.");
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});