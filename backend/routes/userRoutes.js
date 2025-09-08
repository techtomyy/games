const express = require('express');
const router = express.Router();
const {
    getUserById,
    getUserProfile,
    updateUser
} = require('../controllers/userController');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', authenticateToken, checkResourceOwnership('id'), getUserById);

// GET /api/v1/users/:id/profile - Get user profile with statistics
router.get('/:id/profile', authenticateToken, checkResourceOwnership('id'), getUserProfile);

// PUT /api/v1/users/:id - Update user information
router.put('/:id', authenticateToken, checkResourceOwnership('id'), updateUser);

module.exports = router;
