const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { analyzeDrawingWithAI } = require('../controllers/analyzeController');

// POST /api/v1/analyze-drawing
router.post('/', authenticateToken, analyzeDrawingWithAI);

module.exports = router;