const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📨 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const emoji = status >= 400 ? '❌' : '✅';
    
    console.log(
      `${emoji} ${req.method} ${req.originalUrl} - ${status} - ${duration}ms`
    );
  });
  
  next();
};

module.exports = logger;