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

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// CORS: allow localhost in dev, Vercel URL in prod
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin requests (no origin header) and allowed origins
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

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

