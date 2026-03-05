// ============================================================
//  Game Controller — Battle logic (energy-based, no Banana API)
//  [EVENT HANDLER] — Responds to player action events from frontend
//  Power formula: playerPower = Math.floor(basePower * multiplier) + random(0-50)
// ============================================================

const { addEntry } = require('../models/leaderboardModel');

// Each action has a base multiplier that affects the final score
const ACTION_MULTIPLIERS = {
  attack:      1.0,   // Standard attack
  randomSkill: 1.25,  // Random skill — 1.25x boost
  bananaPower: 1.5    // Banana Power — ultimate, 1.5x multiplier
};

// POST /api/game/play
// Body: { character: { name, basePower }, action: 'attack'|'randomSkill'|'bananaPower' }
async function play(req, res) {
  const { character, action } = req.body;

  if (!character || !action) {
    return res.status(400).json({ error: 'Character and action are required.' });
  }

  const multiplier = ACTION_MULTIPLIERS[action] || 1.0;

  try {
    // Arena battle formula — luck modifier is now random (0-50), no Banana API needed in battle
    const luckyBonus   = Math.floor(Math.random() * 51); // 0–50 random bonus
    const playerPower  = Math.floor(character.basePower * multiplier) + luckyBonus;
    const opponentPower = Math.floor(Math.random() * 91) + 70; // 70–160

    const playerWins = playerPower > opponentPower;
    const score = playerWins ? playerPower : 0;

    // Save result to leaderboard
    const entry = {
      id: `match_${Date.now()}`,
      username: req.user.username,
      character: character.name,
      action,
      playerPower,
      opponentPower,
      score,
      result: playerWins ? 'win' : 'lose',
      playedAt: new Date().toISOString()
    };
    await addEntry(entry);

    // Return result to frontend
    return res.json({
      playerPower,
      opponentPower,
      result: playerWins ? 'win' : 'lose',
      score,
      action,
      multiplier,
      luckyBonus
    });

  } catch (err) {
    console.error('Game play error:', err.message);
    return res.status(500).json({ error: 'Something went wrong in the Arena. Try again!' });
  }
}

module.exports = { play };
