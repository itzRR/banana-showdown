// ============================================================
//  Leaderboard Model — Remote DB sync via db.js
// ============================================================

const { getDB, saveDB } = require('./db');

async function addEntry(entry) {
  const db = await getDB();
  if (!db.leaderboard) db.leaderboard = [];

  db.leaderboard.push(entry);
  await saveDB(db);
}

async function getTopFive() {
  const db = await getDB();
  const leaderboard = db.leaderboard || [];

  return [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

module.exports = { addEntry, getTopFive };

