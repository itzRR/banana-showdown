// ============================================================
//  RegisterPage — New user registration (Virtual Identity)
//  [VIRTUAL IDENTITY] — Creates account with bcrypt-hashed password
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { playMusic, TRACKS } from '../utils/music';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🎵 Play main menu music (App.jsx calls playMusic on splash click)
  useEffect(() => {
    playMusic(TRACKS.MENU);
  }, []);

  // [EVENT HANDLER] — Form submit triggers POST /api/auth/register
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/register', { username, password });
      login({ username: res.data.username });
      navigate('/select');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-logo">
          <h1>🍌 Banana Showdown</h1>
          <p>Create your fighter identity</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              className="form-input"
              placeholder="Choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="At least 4 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={4}
              required
              autoComplete="new-password"
            />
          </div>
          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : '🍌 Join the Showdown'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
