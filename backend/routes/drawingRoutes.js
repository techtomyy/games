const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    createDrawing,
    getMyDrawings,
    getDrawingById,
    updateDrawing,
    deleteDrawing
} = require('../controllers/drawingController');

// Authenticated routes
router.post('/', authenticateToken, createDrawing);
router.get('/', authenticateToken, getMyDrawings);
router.get('/:id', authenticateToken, getDrawingById);
router.put('/:id', authenticateToken, updateDrawing);
router.delete('/:id', authenticateToken, deleteDrawing);

module.exports = router;


