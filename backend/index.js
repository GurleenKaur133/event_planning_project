const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// DB connection
require('./config/db');

// Routes
const testRoute = require('./routes/test.route');
const authRoute = require('./routes/auth.route');

app.use('/api', testRoute);
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
  res.send("Backend API is running.");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});