// ============================================================
//  App.jsx — React Router setup
//  Defines all routes and wraps protected ones
// ============================================================

import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CharacterSelectPage from './pages/CharacterSelectPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { unlockAudio } from './utils/sounds';
import { prefetchCharacterVideos } from './utils/prefetch';
import { playMusic, TRACKS } from './utils/music';

function App() {
  const { user, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  function handleSplashClick() {
    // ✅ Everything here runs synchronously inside the user gesture
    // so HTMLAudioElement.play() is guaranteed to be allowed by the browser.
    unlockAudio();
    prefetchCharacterVideos();
    setSplashDone(true);

    // Play the right track for whatever page is currently showing
    const path = window.location.pathname;
    if (path.startsWith('/game'))   playMusic(TRACKS.BATTLE);
    else if (path.startsWith('/select')) playMusic(TRACKS.CHARACTER);
    else                             playMusic(TRACKS.MENU);
  }

  // Wait for session check before rendering routes
  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <p>Loading Banana Showdown…</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Global Click-to-Start splash — shows every page load ── */}
      {!splashDone && (
        <div
          id="click-to-start"
          onClick={handleSplashClick}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d1a0d 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <img
            src="/favicon-96x96.png"
            alt="Banana Showdown Logo"
            style={{
              width: 96, height: 96, marginBottom: 16, borderRadius: 20,
              animation: 'pulse 1.5s ease-in-out infinite',
              filter: 'drop-shadow(0 0 24px rgba(255,224,102,0.6))',
            }}
          />
          <h1 className="splash-title" style={{ color: '#ffe066', fontSize: '2.2rem', fontWeight: 900, marginBottom: 8, letterSpacing: 2 }}>
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

      <Navbar />
      <Routes>
        {/* Public routes — redirect to /select if already logged in */}
        <Route path="/login"    element={user ? <Navigate to="/select" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/select" replace /> : <RegisterPage />} />

        {/* Protected routes — require login */}
        <Route path="/select" element={
          <ProtectedRoute><CharacterSelectPage /></ProtectedRoute>
        } />
        <Route path="/game" element={
          <ProtectedRoute><GamePage /></ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute><LeaderboardPage /></ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;

