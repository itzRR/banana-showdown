// ============================================================
//  Leaderboard Model — In-memory storage seeded from db.json
//  Uses require() so Vercel bundles the JSON file.
//  Writes are in-memory only (Vercel filesystem is read-only).
// ============================================================

const seed = require('../data/db.json');
let leaderboard = Array.isArray(seed.leaderboard) ? [...seed.leaderboard] : [];

function addEntry(entry) {
  leaderboard.push(entry);
}

function getTopFive() {
  return [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

module.exports = { addEntry, getTopFive };

