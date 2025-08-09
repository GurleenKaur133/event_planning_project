const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');

// Security middleware setup
const setupSecurity = (app) => {
  // Helmet - Set security HTTP headers
  app.use(helmet());
  
  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());
  
  // Data sanitization against XSS
  app.use(xss());
  
  // Prevent parameter pollution
  app.use((req, res, next) => {
    // Clean up query params
    for (let param in req.query) {
      if (Array.isArray(req.query[param])) {
        req.query[param] = req.query[param][req.query[param].length - 1];
      }
    }
    next();
  });
};

module.exports = setupSecurity;