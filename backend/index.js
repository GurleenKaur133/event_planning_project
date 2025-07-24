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
app.use('/api', testRoute);

app.get('/', (req, res) => {
  res.send("Backend API is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
