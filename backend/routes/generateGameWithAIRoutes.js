const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { generateGameWithAI } = require('../controllers/generateGameWithAIControllor');

// AI-powered generation
router.post('/', authenticateToken, generateGameWithAI);

module.exports = router;