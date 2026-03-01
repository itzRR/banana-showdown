// ============================================================
//  User Model — In-memory storage seeded from db.json
//  Uses require() so Vercel bundles the JSON file.
//  Writes are in-memory only (Vercel filesystem is read-only).
// ============================================================

// Load initial data — require() ensures Vercel includes this in the bundle
const seed = require('../data/db.json');
let users = Array.isArray(seed.users) ? [...seed.users] : [];

function findUserByUsername(username) {
  return users.find(u => u.username === username) || null;
}

function findUserById(id) {
  return users.find(u => u.id === id) || null;
}

function saveUser(user) {
  users.push(user);
}

module.exports = { findUserByUsername, findUserById, saveUser };

