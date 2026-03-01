// ============================================================
//  User Model — Remote DB sync via db.js
// ============================================================

const { getDB, saveDB } = require('./db');

async function findUserByUsername(username) {
  const db = await getDB();
  const users = db.users || [];
  return users.find(u => u.username === username) || null;
}

async function findUserById(id) {
  const db = await getDB();
  const users = db.users || [];
  return users.find(u => u.id === id) || null;
}

async function saveUser(user) {
  const db = await getDB();
  if (!db.users) db.users = [];
  
  db.users.push(user);
  await saveDB(db);
}

module.exports = { findUserByUsername, findUserById, saveUser };

