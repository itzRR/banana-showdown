// ============================================================
//  Game Controller — Battle logic (energy-based, no Banana API)
//  Formula: playerPower = floor(basePower × multiplier)  [no lucky bonus]
//  Opponent: playerPower × (0.5 + random)  → range 50%–150% of player, 50/50 win rate
//  Higher cost = bigger multiplier = bigger score when you win
// ============================================================

const { addEntry } = require('../models/leaderboardModel');

// Multipliers only affect the score magnitude — all actions are 50/50 odds
const ACTION_MULTIPLIERS = {
  attack:      1.0,   // ⚔️  Cheap — standard power
  randomSkill: 1.5,   // 🎲  Medium — 1.5× payoff
  bananaPower: 2.5    // 🍌  Expensive — 2.5× payoff
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
    // Player power — deterministic, no lucky bonus
    const playerPower = Math.floor(character.basePower * multiplier);

    // 70% chance for the player to win — making it more rewarding
    const playerWins = Math.random() < 0.7;

    // Generate opponent power that reflects the decided outcome
    // Win:  boss is 50–99% of player power
    // Lose: boss is 101–150% of player power
    const opponentPower = playerWins
      ? Math.floor(playerPower * (0.5  + Math.random() * 0.49))
      : Math.floor(playerPower * (1.01 + Math.random() * 0.49));

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
      multiplier
    });

  } catch (err) {
    console.error('Game play error:', err.message);
    return res.status(500).json({ error: 'Something went wrong in the Arena. Try again!' });
  }
}

module.exports = { play };
