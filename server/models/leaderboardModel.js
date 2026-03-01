// ============================================================
//  Leaderboard Model — Remote DB sync via db.js
// ============================================================

const { getDB, saveDB } = require('./db');

async function addEntry(entry) {
  const db = await getDB();
  if (!db.leaderboard) db.leaderboard = [];

  // Find if this user already has a score on the leaderboard
  const existingIndex = db.leaderboard.findIndex(e => e.username === entry.username);

  if (existingIndex !== -1) {
    // If they exist, only overwrite if the new score is strictly strictly higher
    if (entry.score > db.leaderboard[existingIndex].score) {
      db.leaderboard[existingIndex] = entry;
      await saveDB(db);
    }
  } else {
    // New user entirely
    db.leaderboard.push(entry);
    await saveDB(db);
  }
}

async function getTopTen() {
  const db = await getDB();
  const leaderboard = db.leaderboard || [];

  return [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

module.exports = { addEntry, getTopTen };

