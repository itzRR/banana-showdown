// ============================================================
//  Navbar — Top navigation bar
// ============================================================

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleMute, isMuted } from '../utils/music';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(isMuted());

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function handleMusicToggle() {
    const nowMuted = toggleMute();
    setMuted(nowMuted);
  }

  return (
    <nav className="navbar">
      <NavLink to={user ? '/select' : '/login'} className="navbar-brand">
        🍌 Banana <span>Showdown</span>
      </NavLink>

      {user && (
        <div className="navbar-links">
          <NavLink to="/select" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Characters
          </NavLink>
          <NavLink to="/game" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Battle
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Leaderboard
          </NavLink>
        </div>
      )}

      <div className="nav-user">
        {/* 🎵 Music on/off toggle — always visible */}
        <button
          id="music-toggle"
          className="music-toggle-btn"
          onClick={handleMusicToggle}
          title={muted ? 'Turn music on' : 'Turn music off'}
          aria-label={muted ? 'Unmute music' : 'Mute music'}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {user ? (
          <>
            <span>👤 <span className="nav-username">{user.username}</span></span>
            <button className="btn btn-danger btn-sm" onClick={handleLogout} id="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <div className="navbar-links">
            <NavLink to="/login" className="nav-link">Login</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">Register</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
