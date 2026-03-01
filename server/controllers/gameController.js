// ============================================================
//  Game Controller — Banana API interoperability + game logic
//  [API INTEROPERABILITY] — Backend calls Banana API here
//  [EVENT HANDLER] — Responds to player action events from frontend
// ============================================================

const fetch = require('node-fetch');
const { addEntry } = require('../models/leaderboardModel');

// Banana API endpoint
const BANANA_API_URL = 'http://marcconrad.com/uob/banana/api.php?out=json';

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
    // [API INTEROPERABILITY] — Call external Banana API
    const bananaRes = await fetch(BANANA_API_URL);
    if (!bananaRes.ok) {
      throw new Error(`Banana API responded with status ${bananaRes.status}`);
    }

    // Parse JSON response from Banana API
    // Response shape: { question: "<image_url>", solution: <number 0-9> }
    const bananaData = await bananaRes.json();

    const bananaNumber = bananaData.solution; // 0–9 modifier from the puzzle
    const puzzleImageUrl = bananaData.question; // URL of the banana math puzzle image

    // Game logic:
    // Player's final power = basePower + (bananaNumber * 10) * multiplier
    // Opponent gets a fixed random power between 50–100
    const playerPower = Math.floor((character.basePower + bananaNumber * 10) * multiplier);
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
      bananaNumber,
      score,
      result: playerWins ? 'win' : 'lose',
      playedAt: new Date().toISOString()
    };
    addEntry(entry);

    // Return full result to frontend
    return res.json({
      bananaNumber,         // The puzzle solution (0–9)
      puzzleImageUrl,       // The banana math puzzle image to display
      playerPower,
      opponentPower,
      result: playerWins ? 'win' : 'lose',
      score,
      action,
      multiplier
    });

  } catch (err) {
    console.error('Banana API error:', err.message);
    return res.status(502).json({ error: 'Could not reach Banana API. Please try again.' });
  }
}

module.exports = { play };
