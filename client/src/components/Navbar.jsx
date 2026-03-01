// ============================================================
//  Navbar — Top navigation bar
// ============================================================

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
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

      {user ? (
        <div className="nav-user">
          <span>👤 <span className="nav-username">{user.username}</span></span>
          <button className="btn btn-danger btn-sm" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      ) : (
        <div className="navbar-links">
          <NavLink to="/login" className="nav-link">Login</NavLink>
          <NavLink to="/register" className="btn btn-primary btn-sm">Register</NavLink>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
