const axios = require('axios');

// Paste your JSONBin URL and Key here to clear the leaderboard
const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/69a489a8ae596e708f55a6d5';
const JSONBIN_KEY = '$2a$10$PxVse9MONYxFao3N7.jsluUya4jsqgd7YZ2TpD62zn0WRZL2wXTjy';

async function clearLeaderboard() {
  if (JSONBIN_URL.includes('YOUR_BIN_ID')) {
    return console.log('❌ Please edit clear-db.js and paste your JSONBIN_URL and JSONBIN_KEY first!');
  }

  try {
    console.log('Fetching current DB...');
    const res = await axios.get(JSONBIN_URL, { headers: { 'X-Master-Key': JSONBIN_KEY } });
    
    const db = res.data.record;
    console.log(`Current leaderboard has ${db.leaderboard.length} entries.`);
    
    // Clear leaderboard
    db.leaderboard = [];
    
    console.log('Saving cleared DB...');
    await axios.put(JSONBIN_URL, db, {
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY
      }
    });

    console.log('✅ Leaderboard successfully cleared!');
  } catch (err) {
    console.error('❌ Error clearing DB:', err.response?.data || err.message);
  }
}

clearLeaderboard();
