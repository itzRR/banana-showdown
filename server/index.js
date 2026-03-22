// ============================================================
//  Banana Showdown — Server Entry Point
//  Sets up Express app, middleware, and mounts all routes
//  Exported as a module for Vercel serverless deployment
// ============================================================

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const leaderboardRoutes = require('./routes/leaderboard');
const puzzleRoutes = require('./routes/puzzle');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// CORS: allow all origins (frontend + backend are same-domain on Vercel)
app.use(cors({ origin: true, credentials: true }));

// --- Routes ---
// API endpoints used by the frontend client
app.use('/api/auth', authRoutes); // Handles user authentication & sessions
app.use('/api/game', gameRoutes); // Core game interactions and logic
app.use('/api/leaderboard', leaderboardRoutes); // Global scoring & rankings
app.use('/api/puzzle', puzzleRoutes); // Logic for puzzle generation and validation

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Banana Showdown API is running 🍌' });
});

// Only start HTTP server when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🍌 Banana Showdown server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless runtime
module.exports = app;

