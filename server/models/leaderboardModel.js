// ============================================================
//  Leaderboard Model — Read/write leaderboard from JSON DB
// ============================================================

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Add a new match result entry
function addEntry(entry) {
  const db = readDB();
  db.leaderboard.push(entry);
  writeDB(db);
}

// Get top 5 entries sorted by score descending
function getTopFive() {
  const db = readDB();
  return db.leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

module.exports = { addEntry, getTopFive };
