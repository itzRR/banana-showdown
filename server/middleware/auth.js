// ============================================================
//  Auth Middleware — Verifies JWT from HTTP-only cookie
//  [VIRTUAL IDENTITY] — Establishes who the current user is
// ============================================================

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'banana_showdown_secret_key_2024';

function authMiddleware(req, res, next) {
  // Read token from the HTTP-only cookie set at login
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  try {
    // Verify and decode — attaches user payload to request
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

module.exports = authMiddleware;
