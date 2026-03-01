// ============================================================
//  Game Routes — Play action against Banana API
//  [EVENT] — Receives player action events from the frontend
//  [API INTEROPERABILITY] — Triggers backend Banana API call
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { play } = require('../controllers/gameController');

// Protected — only logged-in users can play
// POST /api/game/play
router.post('/play', authMiddleware, play);

module.exports = router;
