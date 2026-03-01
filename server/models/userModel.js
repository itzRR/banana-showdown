// ============================================================
//  User Model — In-memory + Local File Fallback
//  Uses require() so Vercel bundles the JSON file.
//  Writes to db.json locally, but stays in-memory on Vercel.
// ============================================================

const fs = require('fs');
const path = require('path');
const seed = require('../data/db.json');

const DB_PATH = path.join(__dirname, '../data/db.json');
let users = Array.isArray(seed.users) ? [...seed.users] : [];

function saveLocally() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const fullDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      fullDb.users = users;
      fs.writeFileSync(DB_PATH, JSON.stringify(fullDb, null, 2));
    } catch (err) {
      console.error('Failed to save users locally:', err.message);
    }
  }
}

function findUserByUsername(username) {
  return users.find(u => u.username === username) || null;
}

function findUserById(id) {
  return users.find(u => u.id === id) || null;
}

function saveUser(user) {
  users.push(user);
  saveLocally();
}

module.exports = { findUserByUsername, findUserById, saveUser };

