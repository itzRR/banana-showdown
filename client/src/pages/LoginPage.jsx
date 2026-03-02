// ============================================================
//  LoginPage — User authentication (Virtual Identity)
//  [VIRTUAL IDENTITY] — Login form, issues JWT cookie via backend
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { playMusic, stopMusic, TRACKS } from '../utils/music';
import { unlockAudio } from '../utils/sounds';
import { prefetchCharacterVideos } from '../utils/prefetch';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false); // always show splash

  const { login } = useAuth();
  const navigate = useNavigate();

  // Cleanup music on unmount
  useEffect(() => () => stopMusic(), []);

  function handleUnlock() {
    // ✅ Call INSIDE the click handler so browser allows audio.play()
    unlockAudio();
    playMusic(TRACKS.MENU);
    setAudioUnlocked(true);
    // 🎬 Start prefetching character videos in the background
    prefetchCharacterVideos();
  }

  // [EVENT HANDLER] — Form submit triggers POST /api/auth/login
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { username, password });
      login({ username: res.data.username });
      navigate('/select');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Click-to-Start splash (unlocks browser audio) ── */}
      {!audioUnlocked && (
        <div
          id="click-to-start"
          onClick={handleUnlock}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d1a0d 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>🍌</div>
          <h1 style={{ color: '#ffe066', fontSize: '2.2rem', fontWeight: 900, marginBottom: 8, letterSpacing: 2 }}>
            Banana Showdown
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 40 }}>The ultimate banana battle arena</p>
          <button
            style={{
              background: 'linear-gradient(135deg, #ffe066, #ff9900)',
              color: '#1a1a1a', border: 'none', borderRadius: 50,
              padding: '16px 48px', fontSize: '1.15rem', fontWeight: 800,
              cursor: 'pointer', letterSpacing: 1,
              boxShadow: '0 0 32px rgba(255,224,102,0.45)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            🎮 Click to Start
          </button>

        </div>
      )}

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
    </>
  );
}

export default LoginPage;

