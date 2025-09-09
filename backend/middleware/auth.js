const { supabase } = require('../config/supabase');

// Authentication middleware to protect routes
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Access token is required"
            });
        }
        
        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token"
            });
        }
        
        // Add user information to request object
        req.user = {
            id: user.id,
            email: user.email,
            firstname: user.user_metadata?.first_name || '',
            lastname: user.user_metadata?.last_name || '',
            fullname: user.user_metadata?.full_name || '',
            email_confirmed: user.email_confirmed_at ? true : false
        };
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            error: "Authentication failed"
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (!error && user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    firstname: user.user_metadata?.first_name || '',
                    lastname: user.user_metadata?.last_name || '',
                    fullname: user.user_metadata?.full_name || '',
                    email_confirmed: user.email_confirmed_at ? true : false
                };
            }
        }
        
        next();
    } catch (error) {
        console.error('Optional authentication error:', error);
        // Continue without authentication
        next();
    }
};

// Middleware to check if user email is confirmed
const requireEmailConfirmation = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: "Authentication required"
        });
    }
    
    if (!req.user.email_confirmed) {
        return res.status(403).json({
            success: false,
            error: "Email confirmation required. Please check your email and confirm your account."
        });
    }
    
    next();
};

// Middleware to check if user owns the resource
const checkResourceOwnership = (resourceUserIdField = 'user_id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }
        
        // Check if the resource belongs to the authenticated user
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        
        if (resourceUserId && resourceUserId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: "Access denied. You can only access your own resources."
            });
        }
        
        next();
    };
};

// Middleware to validate user permissions
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Authentication required"
            });
        }
        
        // Add permission checking logic here
        // For now, we'll just check if user is authenticated
        // You can extend this to check specific permissions
        
        next();
    };
};

// Rate limiting middleware for auth endpoints
const authRateLimit = (req, res, next) => {
    // Simple in-memory rate limiting (in production, use Redis or similar)
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 10; // 10 attempts per window
    
    // This is a basic implementation - in production, use a proper rate limiting library
    if (!global.authAttempts) {
        global.authAttempts = new Map();
    }
    
    const attempts = global.authAttempts.get(clientIp) || { count: 0, resetTime: now + windowMs };
    
    if (now > attempts.resetTime) {
        attempts.count = 0;
        attempts.resetTime = now + windowMs;
    }
    
    if (attempts.count >= maxAttempts) {
        return res.status(429).json({
            success: false,
            error: "Too many authentication attempts. Please try again later."
        });
    }
    
    attempts.count++;
    global.authAttempts.set(clientIp, attempts);
    
    next();
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireEmailConfirmation,
    checkResourceOwnership,
    requirePermission,
    authRateLimit
};
