// ============================================================
//  LoginPage — User authentication (Virtual Identity)
//  [VIRTUAL IDENTITY] — Login form, issues JWT cookie via backend
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { playMusic, stopMusic, TRACKS } from '../utils/music';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🎵 Play main menu music
  useEffect(() => {
    playMusic(TRACKS.MENU);
    return () => stopMusic();
  }, []);

  // [EVENT HANDLER] — Form submit triggers POST /api/auth/login
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login',
        { username, password },
        { withCredentials: true }
      );
      login({ username: res.data.username });
      navigate('/select');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-logo">
          <h1>🍌 Banana Showdown</h1>
          <p>Sign in to enter the arena</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : '⚔️ Enter the Arena'}
          </button>
        </form>

        <div className="auth-footer">
          No account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
