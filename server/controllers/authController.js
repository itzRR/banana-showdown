// ============================================================
//  Auth Controller — Register, Login, Logout, Me
//  [VIRTUAL IDENTITY] — Creates and verifies user sessions
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername, saveUser, findUserById } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'banana_showdown_secret_key_2024';
const COOKIE_OPTIONS = {
  httpOnly: true,   // Not accessible via JS — prevents XSS
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

// POST /api/auth/register
async function register(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  // Check if username already taken
  if (findUserByUsername(username)) {
    return res.status(409).json({ error: 'Username already taken.' });
  }

  // Hash password with bcrypt (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: `user_${Date.now()}`,
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  saveUser(newUser);

  // Issue JWT and set in HTTP-only cookie
  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.status(201).json({ message: 'Registered successfully!', username: newUser.username });
}

// POST /api/auth/login
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // Issue JWT cookie
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, COOKIE_OPTIONS);

  return res.json({ message: 'Logged in!', username: user.username });
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie('token');
  return res.json({ message: 'Logged out.' });
}

// GET /api/auth/me — Returns current user from cookie (used to restore session)
function me(req, res) {
  return res.json({ id: req.user.id, username: req.user.username });
}

module.exports = { register, login, logout, me };
