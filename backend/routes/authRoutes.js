const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    logout,
    getCurrentUser,
    resendConfirmation
} = require('../controllers/authController');
const { authRateLimit } = require('../middleware/auth');

// POST /api/v1/auth/signup - User registration
router.post('/signup', authRateLimit, signup);

// POST /api/v1/auth/login - User login
router.post('/login', authRateLimit, login);

// POST /api/v1/auth/logout - User logout
router.post('/logout', logout);

// GET /api/v1/auth/me - Get current user
router.get('/me', getCurrentUser);

// POST /api/v1/auth/resend-confirmation - Resend email confirmation
router.post('/resend-confirmation', authRateLimit, resendConfirmation);

module.exports = router;
