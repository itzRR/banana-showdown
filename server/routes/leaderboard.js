// ============================================================
//  Leaderboard Routes — Get top 5 scores / Save score
// ============================================================

const express = require('express');
const router = express.Router();
const { getTopTen } = require('../models/leaderboardModel');

// GET /api/leaderboard — Public, returns top 10 scores
router.get('/', async (req, res) => {
  const topScores = await getTopTen();
  return res.json(topScores);
});

module.exports = router;
