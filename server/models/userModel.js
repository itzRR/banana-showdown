// ============================================================
//  User Model — Read/write users from the JSON "database"
// ============================================================

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/db.json');

// Read the entire database JSON
function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

// Write the entire database JSON
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Find a user by username
function findUserByUsername(username) {
  const db = readDB();
  return db.users.find(u => u.username === username) || null;
}

// Find a user by their ID
function findUserById(id) {
  const db = readDB();
  return db.users.find(u => u.id === id) || null;
}

// Save a new user to the database
function saveUser(user) {
  const db = readDB();
  db.users.push(user);
  writeDB(db);
}

module.exports = { findUserByUsername, findUserById, saveUser };
