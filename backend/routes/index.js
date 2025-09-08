const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const healthRoutes = require('./healthRoutes');

// API version prefix
const API_VERSION = '/api/v1';

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use('/health', healthRoutes);

// Root API endpoint
router.get(`${API_VERSION}`, (req, res) => {
    res.json({
        success: true,
        message: 'DrawPlayUniverse API',
        version: '1.0.0',
        endpoints: {
            auth: `${API_VERSION}/auth`,
            users: `${API_VERSION}/users`,
            health: '/health'
        },
        documentation: 'https://github.com/techtomyy/games#api-documentation'
    });
});

module.exports = router;
