// ============================================================
//  Leaderboard Routes — Get top 5 scores / Save score
// ============================================================

const express = require('express');
const router = express.Router();
const { getTopFive } = require('../models/leaderboardModel');

// GET /api/leaderboard — Public, returns top 5 scores
router.get('/', async (req, res) => {
  const topScores = await getTopFive();
  return res.json(topScores);
});

module.exports = router;
