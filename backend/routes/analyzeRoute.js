const { 
  analyzeDrawingWithAI,    // Add this
} = require('../controllers/analyzeController');

// Add these routes
router.post('/analyze-drawing', authenticateToken, analyzeDrawingWithAI);