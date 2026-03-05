// ============================================================
//  Puzzle Route — Banana Trials
//  GET  /api/puzzle         → Get a Banana API puzzle
//  GET  /api/puzzle/energy  → Get current user's energy from DB
//  POST /api/puzzle/energy  → Save user's energy to DB
// ============================================================

const express = require('express');
const router  = express.Router();
const authMiddleware = require('../middleware/auth');
const { findUserById, updateUserEnergy } = require('../models/userModel');
const fetch = require('node-fetch');

const BANANA_API_URL = 'http://marcconrad.com/uob/banana/api.php?out=json';
const INIT_ENERGY    = 100;
const MAX_ENERGY     = 150;

// GET /api/puzzle — fetch a fresh Banana puzzle
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bananaRes = await fetch(BANANA_API_URL);
    if (!bananaRes.ok) throw new Error(`Banana API responded with status ${bananaRes.status}`);
    const data = await bananaRes.json();
    return res.json({ question: data.question, solution: data.solution });
  } catch (err) {
    console.error('Banana API error (puzzle):', err.message);
    return res.status(502).json({ error: 'Could not reach the Banana Oracle. Try again!' });
  }
});

// GET /api/puzzle/energy — load energy for logged-in user
router.get('/energy', authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    // If user has no stored energy yet, return default
    const energy = (user && typeof user.energy === 'number') ? user.energy : INIT_ENERGY;
    return res.json({ energy });
  } catch (err) {
    console.error('Energy load error:', err.message);
    return res.status(500).json({ error: 'Could not load energy.' });
  }
});

// POST /api/puzzle/energy — save energy for logged-in user
router.post('/energy', authMiddleware, async (req, res) => {
  try {
    let { energy } = req.body;
    if (typeof energy !== 'number') return res.status(400).json({ error: 'Energy must be a number.' });
    // Clamp to valid range
    energy = Math.max(0, Math.min(Math.round(energy), MAX_ENERGY));
    await updateUserEnergy(req.user.id, energy);
    return res.json({ energy });
  } catch (err) {
    console.error('Energy save error:', err.message);
    return res.status(500).json({ error: 'Could not save energy.' });
  }
});

module.exports = router;
