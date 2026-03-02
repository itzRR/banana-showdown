// ============================================================
//  Navbar — Top navigation bar (mobile-responsive)
// ============================================================

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleMute, isMuted } from '../utils/music';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(isMuted());
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate('/login');
  }

  function handleMusicToggle() {
    const nowMuted = toggleMute();
    setMuted(nowMuted);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <NavLink to={user ? '/select' : '/login'} className="navbar-brand" onClick={closeMenu}>
          🍌 Banana <span>Showdown</span>
        </NavLink>

        {/* Desktop links */}
        {user && (
          <div className="navbar-links navbar-links-desktop">
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
          {/* 🎵 Music toggle — always visible */}
          <button
            id="music-toggle"
            className="music-toggle-btn"
            onClick={handleMusicToggle}
            title={muted ? 'Turn music on' : 'Turn music off'}
            aria-label={muted ? 'Unmute music' : 'Mute music'}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* Desktop: username + logout OR login/register */}
          {user ? (
            <>
              <span className="nav-user-text">👤 <span className="nav-username">{user.username}</span></span>
              <button className="btn btn-danger btn-sm nav-logout-desktop" onClick={handleLogout} id="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <div className="navbar-links navbar-links-desktop">
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">Register</NavLink>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-nav" role="navigation">
          {user ? (
            <>
              <NavLink to="/select" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
                🎮 Characters
              </NavLink>
              <NavLink to="/game" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
                ⚔️ Battle
              </NavLink>
              <NavLink to="/leaderboard" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} onClick={closeMenu}>
                🏆 Leaderboard
              </NavLink>
              <div className="mobile-nav-divider" />
              <div className="mobile-nav-user">👤 <span className="nav-username">{user.username}</span></div>
              <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="mobile-nav-link" onClick={closeMenu}>Login</NavLink>
              <NavLink to="/register" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={closeMenu}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
