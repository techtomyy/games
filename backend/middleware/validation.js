// Validation middleware for common request validations

// Validate UUID format
const validateUUID = (paramName) => {
    return (req, res, next) => {
        const uuid = req.params[paramName];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        if (!uuid || !uuidRegex.test(uuid)) {
            return res.status(400).json({
                success: false,
                error: `Invalid ${paramName} format. Must be a valid UUID.`
            });
        }
        
        next();
    };
};

// Validate required fields in request body
const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = fields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        
        next();
    };
};

// Validate email format
const validateEmail = (req, res, next) => {
    const email = req.body.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }
    
    next();
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;
    
    if (page && (isNaN(page) || parseInt(page) < 1)) {
        return res.status(400).json({
            success: false,
            error: 'Page must be a positive integer'
        });
    }
    
    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        return res.status(400).json({
            success: false,
            error: 'Limit must be a positive integer between 1 and 100'
        });
    }
    
    next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
    // Remove any potential XSS attempts
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };
    
    // Recursively sanitize object
    const sanitizeObject = (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return sanitizeString(obj);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        
        const sanitized = {};
        for (const key in obj) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
    };
    
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    
    next();
};

module.exports = {
    validateUUID,
    validateRequiredFields,
    validateEmail,
    validatePagination,
    sanitizeInput
};
