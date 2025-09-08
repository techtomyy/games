const express = require('express');
const router = express.Router();
const {
    getHealth,
    getSystemInfo,
    testDatabaseConnection
} = require('../controllers/healthController');

// GET /health - Basic health check
router.get('/', getHealth);

// GET /health/system - Detailed system information
router.get('/system', getSystemInfo);

// GET /health/database - Test database connection
router.get('/database', testDatabaseConnection);

module.exports = router;
