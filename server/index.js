// ============================================================
//  Banana Showdown — Server Entry Point
//  Sets up Express app, middleware, and mounts all routes
// ============================================================

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// Allow the Vite dev server (client) to call the backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // required for cookies
}));

// --- Routes ---
// [AUTH] Virtual identity / session management
app.use('/api/auth', authRoutes);

// [GAME] Gameplay & Banana API interoperability
app.use('/api/game', gameRoutes);

// [LEADERBOARD] Match result storage and retrieval
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Banana Showdown API is running 🍌' });
});

app.listen(PORT, () => {
  console.log(`🍌 Banana Showdown server running on http://localhost:${PORT}`);
});
