// ============================================================
//  Remote DB Sync (JSONBin.io)
//  Since Vercel is stateless and read-only, we store our DB
//  remotely on a free JSONBin instance.
// ============================================================

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Fallback to local file if no JSONBIN keys are provided
const LOCAL_DB_PATH = path.join(__dirname, '../data/db.json');

// Get from https://jsonbin.io/ (Free)
// e.g. Vercel Env Vars: 
// JSONBIN_URL = https://api.jsonbin.io/v3/b/<BIN_ID>
// JSONBIN_KEY = <SECRET_KEY>
const JSONBIN_URL = process.env.JSONBIN_URL;
const JSONBIN_KEY = process.env.JSONBIN_KEY;

// Cache the DB in memory so we don't spam the API on every read
let memoryCache = null;

async function getDB() {
  if (memoryCache) return memoryCache;

  // If we have remote DB configured, fetch it
  if (JSONBIN_URL && JSONBIN_KEY) {
    try {
      const res = await axios.get(JSONBIN_URL, {
        headers: { 'X-Access-Key': JSONBIN_KEY }
      });
      memoryCache = res.data.record;
      return memoryCache;
    } catch (err) {
      console.error('Failed to fetch from JSONBin, falling back to local DB:', err.message);
    }
  }

  // Fallback to local JSON file
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    memoryCache = JSON.parse(raw);
    return memoryCache;
  } catch (err) {
    console.error('Failed to read local DB:', err.message);
    return { users: [], leaderboard: [] };
  }
}

async function saveDB(newDbData) {
  memoryCache = newDbData; // Update memory cache instantly

  // Save to remote DB
  if (JSONBIN_URL && JSONBIN_KEY) {
    try {
      await axios.put(JSONBIN_URL, newDbData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': JSONBIN_KEY
        }
      });
      return true;
    } catch (err) {
      console.error('Failed to save to JSONBin:', err.message);
    }
  }

  // Save to local file (fails gracefully on Vercel)
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(newDbData, null, 2));
    return true;
  } catch (err) {
    console.log('Skipped local save (read-only FS or missing file).');
    return false;
  }
}

module.exports = { getDB, saveDB };
