// ============================================================
//  Leaderboard Model — In-memory + Local File Fallback
//  Uses require() so Vercel bundles the JSON file.
//  Writes to db.json locally, but stays in-memory on Vercel.
// ============================================================

const fs = require('fs');
const path = require('path');
const seed = require('../data/db.json');
const DB_PATH = path.join(__dirname, '../data/db.json');

// In-memory array (used by Vercel between cold starts)
let leaderboard = Array.isArray(seed.leaderboard) ? [...seed.leaderboard] : [];

function addEntry(entry) {
  leaderboard.push(entry);
  
  // Try to write to disk (works locally, fails gracefully on Vercel)
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const fullDb = JSON.parse(raw);
    fullDb.leaderboard = leaderboard;
    fs.writeFileSync(DB_PATH, JSON.stringify(fullDb, null, 2));
  } catch (err) {
    // Vercel read-only filesystem triggers this — safe to ignore
    console.log('Skipped local save (Vercel read-only FS or missing file).');
  }
}

function getTopFive() {
  return [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

module.exports = { addEntry, getTopFive };

