// Request logging middleware
const logger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        originalEnd.call(this, chunk, encoding);
    };
    
    next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
    console.error(`${new Date().toISOString()} - ERROR - ${req.method} ${req.originalUrl} - ${err.message}`);
    console.error(err.stack);
    next(err);
};

module.exports = {
    logger,
    errorLogger
};
