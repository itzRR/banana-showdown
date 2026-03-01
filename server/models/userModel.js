// ============================================================
//  User Model — In-memory + Local File Fallback
//  Uses require() so Vercel bundles the JSON file.
//  Writes to db.json locally, but stays in-memory on Vercel.
// ============================================================

const fs = require('fs');
const path = require('path');
const seed = require('../data/db.json');
const DB_PATH = path.join(__dirname, '../data/db.json');

// In-memory array (used by Vercel between cold starts)
let users = Array.isArray(seed.users) ? [...seed.users] : [];

function findUserByUsername(username) {
  return users.find(u => u.username === username) || null;
}

function findUserById(id) {
  return users.find(u => u.id === id) || null;
}

function saveUser(user) {
  users.push(user);
  
  // Try to write to disk (works locally, fails gracefully on Vercel)
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const fullDb = JSON.parse(raw);
    fullDb.users = users;
    fs.writeFileSync(DB_PATH, JSON.stringify(fullDb, null, 2));
  } catch (err) {
    // Vercel read-only filesystem triggers this — safe to ignore
    console.log('Skipped local save (Vercel read-only FS or missing file).');
  }
}

module.exports = { findUserByUsername, findUserById, saveUser };

