// ============================================================
//  Auth Routes — Register, Login, Logout, Me
//  [VIRTUAL IDENTITY] — Establishes user sessions via JWT cookies
// ============================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { register, login, logout, me } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected — requires valid JWT cookie
router.get('/me', authMiddleware, me);

module.exports = router;
