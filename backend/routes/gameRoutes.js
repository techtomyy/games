const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
    createGame,
    getMyGames,
    getPublicGames,
    getGameById,
    updateGame,
    deleteGame,
    incrementPlays,
    incrementLikes
} = require('../controllers/gameController');

// Public list of games
router.get('/public', optionalAuth, getPublicGames);

// Authenticated user games
router.post('/', authenticateToken, createGame);
router.get('/me', authenticateToken, getMyGames);
router.get('/:id', optionalAuth, getGameById);
router.put('/:id', authenticateToken, updateGame);
router.delete('/:id', authenticateToken, deleteGame);

// Simple counters
router.post('/:id/play', optionalAuth, incrementPlays);
router.post('/:id/like', authenticateToken, incrementLikes);

module.exports = router;


