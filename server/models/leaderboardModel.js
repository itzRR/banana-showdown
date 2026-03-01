// ============================================================
//  Leaderboard Model — In-memory + Local File Fallback
//  Uses require() so Vercel bundles the JSON file.
//  Writes to db.json locally, but stays in-memory on Vercel.
// ============================================================

const fs = require('fs');
const path = require('path');
const seed = require('../data/db.json');

const DB_PATH = path.join(__dirname, '../data/db.json');
let leaderboard = Array.isArray(seed.leaderboard) ? [...seed.leaderboard] : [];

function saveLocally() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const fullDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      fullDb.leaderboard = leaderboard;
      fs.writeFileSync(DB_PATH, JSON.stringify(fullDb, null, 2));
    } catch (err) {
      console.error('Failed to save leaderboard locally:', err.message);
    }
  }
}

function addEntry(entry) {
  leaderboard.push(entry);
  saveLocally();
}

function getTopFive() {
  return [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

module.exports = { addEntry, getTopFive };

