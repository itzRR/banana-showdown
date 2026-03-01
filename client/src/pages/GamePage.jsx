// ============================================================
//  GamePage — Core gameplay: action buttons → Banana API → result
//  [EVENT-DRIVEN] — Button clicks trigger handleAction event
//  [API INTEROPERABILITY] — axios.post('/api/game/play') calls backend
//                           which then calls the Banana API
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  soundAttack, soundRandomSkill, soundBananaPower,
  soundOracle, soundWin, soundLose, soundClick
} from '../utils/sounds';
import { playMusic, stopMusic, TRACKS } from '../utils/music';

// Opponent definition
const OPPONENT = {
  name: 'Banana Boss',
  avatar: '🍌',
  characterClass: 'Boss'
};

function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Character passed from CharacterSelectPage via router state
  const character = location.state?.character;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef(null);

  // 🎵 Battle music on mount → Victory on win
  useEffect(() => {
    playMusic(TRACKS.BATTLE);
    return () => stopMusic();
  }, []);

  useEffect(() => {
    if (result?.result === 'win') {
      setTimeout(() => playMusic(TRACKS.VICTORY), 300);
    }
  }, [result]);

  // Auto-scroll to result banner when it appears
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [result]);

  // Redirect to select if no character chosen
  if (!character) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ fontSize: '1.5rem', marginBottom: 24 }}>🙈 No character selected!</p>
        <button className="btn btn-primary" onClick={() => navigate('/select')}>
          Pick a Character
        </button>
      </div>
    );
  }

  // -------------------------------------------------------
  // [EVENT HANDLER] — Triggered by Attack / Random Skill / Banana Power buttons
  // Sends action to backend → backend calls Banana API → returns result
  // -------------------------------------------------------
  async function handleAction(action) {
    setLoading(true);
    setError('');
    setResult(null);

    // 🎵 Switch back to battle music when starting a new round (after victory)
    playMusic(TRACKS.BATTLE);

    // 🔊 Play immediate action sound on button press
    if (action === 'attack')       soundAttack();
    if (action === 'randomSkill')  soundRandomSkill();
    if (action === 'bananaPower')  soundBananaPower();

    try {
      setTimeout(soundOracle, 450);

      const res = await api.post(
        '/api/game/play',
        { character: { name: character.name, basePower: character.basePower }, action }
      );

      setResult(res.data);

      setTimeout(() => {
        if (res.data.result === 'win') soundWin();
        else soundLose();
      }, 200);

    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  const maxPower = 200;
  const playerBarWidth = result
    ? Math.min((result.playerPower / maxPower) * 100, 100)
    : (character.basePower / maxPower) * 100;
  const opponentBarWidth = result
    ? Math.min((result.opponentPower / maxPower) * 100, 100)
    : 40;

  return (
    <div className="page">
      <div className="page-header">
        <h1>⚔️ Battle Arena</h1>
        <p>Playing as <strong style={{ color: 'var(--yellow)' }}>{character.name}</strong> — Choose your move!</p>
      </div>

      {/* Fighter cards */}
      <div className="game-layout">
        {/* Player */}
        <div className="card fighter-panel">
          {character.image
            ? <img src={character.image} alt={character.name}
                style={{ width: 90, height: 90, objectFit: 'cover', objectPosition: 'top',
                         borderRadius: 12, marginBottom: 10, border: '2px solid var(--border-bright)' }} />
            : <span className="fighter-avatar">{character.avatar}</span>
          }
          <div className="fighter-label">Your Fighter</div>
          <div className="fighter-name">{character.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            {character.characterClass}
          </div>
          <div className="power-bar-wrapper">
            <div className="power-bar-label">
              <span>Power</span>
              <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>
                {result ? result.playerPower : character.basePower}
              </span>
            </div>
            <div className="power-bar-track">
              <div
                className="power-bar-fill player"
                style={{ width: `${playerBarWidth}%` }}
              />
            </div>
          </div>
        </div>

        {/* VS divider */}
        <div className="vs-divider card" style={{ fontSize: '1.5rem', flexDirection: 'column', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>VS</span>
          <span>⚡</span>
        </div>

        {/* Opponent */}
        <div className="card fighter-panel">
          <span className="fighter-avatar">{OPPONENT.avatar}</span>
          <div className="fighter-label">Opponent</div>
          <div className="fighter-name">{OPPONENT.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            {OPPONENT.characterClass}
          </div>
          <div className="power-bar-wrapper">
            <div className="power-bar-label">
              <span>Power</span>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>
                {result ? result.opponentPower : '???'}
              </span>
            </div>
            <div className="power-bar-track">
              <div
                className="power-bar-fill opponent"
                style={{ width: `${opponentBarWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="card action-panel" style={{ marginTop: 24 }}>
        <h3>Choose Your Move</h3>
        <div className="action-buttons">
          {/* [EVENT] Attack button */}
          <button
            id="btn-attack"
            className="action-btn attack"
            onClick={() => handleAction('attack')}
            disabled={loading}
            title="Standard attack — 1x power multiplier"
          >
            <span className="action-icon">⚔️</span>
            <span>Attack</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1x power</span>
          </button>

          {/* [EVENT] Random Skill button */}
          <button
            id="btn-random-skill"
            className="action-btn random-skill"
            onClick={() => handleAction('randomSkill')}
            disabled={loading}
            title="Random skill — 1.5x power multiplier"
          >
            <span className="action-icon">🎲</span>
            <span>Random Skill</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1.5x power</span>
          </button>

          {/* [EVENT] Banana Power — ultimate move */}
          <button
            id="btn-banana-power"
            className="action-btn banana-power"
            onClick={() => handleAction('bananaPower')}
            disabled={loading}
            title="Banana Power ultimate — 1.5x power multiplier"
          >
            <span className="action-icon">🍌</span>
            <span>Banana Power</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1.5x power</span>
          </button>
        </div>
      </div>

      {/* ── How It Works panel ─────────────────────────── */}
      <div className="how-it-works-wrap" style={{ marginTop: 16 }}>
        <button
          className="how-it-works-toggle"
          onClick={() => setShowHowItWorks(v => !v)}
          id="how-it-works-btn"
        >
          {showHowItWorks ? '▲' : '▼'} &nbsp;❓ How does this work?
        </button>

        {showHowItWorks && (
          <div className="how-it-works-panel">
            <h3 style={{ marginBottom: 16, color: 'var(--yellow)' }}>🍌 How the Battle Works</h3>

            <div className="hiw-steps">
              {/* Step 1 */}
              <div className="hiw-step">
                <div className="hiw-step-num">1</div>
                <div>
                  <strong>Pick your move</strong>
                  <p>Each move has a different power multiplier:</p>
                  <div className="hiw-moves">
                    <span>⚔️ Attack &nbsp;<b>×1.0</b></span>
                    <span>🎲 Random Skill &nbsp;<b>×1.25</b></span>
                    <span>🍌 Banana Power &nbsp;<b>×1.5</b></span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="hiw-step">
                <div className="hiw-step-num">2</div>
                <div>
                  <strong>The Banana Puzzle gives a secret number</strong>
                  <p>
                    The 🍌 Banana API sends a random math puzzle image.
                    The <em>answer</em> to that puzzle is a number from <b>0 to 9</b> — this is your <b>luck modifier</b>.
                    Higher = better!
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="hiw-step">
                <div className="hiw-step-num">3</div>
                <div>
                  <strong>Your power is calculated</strong>
                  <div className="hiw-formula">
                    Your Power = ( Base Power + Banana Number × 10 ) × Multiplier
                  </div>
                  <p className="hiw-example">
                    Example: Base 75 · Banana = 6 · Banana Power (×1.5)<br />
                    → ( 75 + 60 ) × 1.5 = <b style={{ color: 'var(--yellow)' }}>202</b>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="hiw-step">
                <div className="hiw-step-num">4</div>
                <div>
                  <strong>Beat the opponent to win!</strong>
                  <p>
                    The opponent has a <b>random power between 70–160</b>.
                    If <span style={{ color: 'var(--yellow)' }}>Your Power</span> &gt; <span style={{ color: 'var(--red)' }}>Opponent Power</span> → 🏆 Victory!
                    Otherwise → 💀 Defeated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card loading-overlay" style={{ marginTop: 24 }}>
          <div className="spinner" />
          <p>Calling the Banana Oracle… 🍌</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>
      )}

      {/* Banana Puzzle — displayed after each action */}
      {result && (
        <>
          {/* The Banana API math puzzle image */}
          <div className="card banana-puzzle" style={{ marginTop: 24 }}>
            <h3>🍌 The Banana Puzzle Says…</h3>
            {result.puzzleImageUrl && (
              <img
                src={result.puzzleImageUrl}
                alt="Banana API math puzzle"
                className="puzzle-image"
                id="banana-puzzle-image"
              />
            )}
            <div className="puzzle-answer">
              <span className="puzzle-answer-label">Solution modifier:</span>
              <span className="puzzle-answer-number" id="banana-solution">{result.bananaNumber}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 8 }}>
              Multiplier: <strong style={{ color: 'var(--yellow)' }}>{result.multiplier}x</strong>
              &nbsp;→ Your final power: <strong style={{ color: 'var(--yellow)' }}>{result.playerPower}</strong>
              &nbsp; vs Opponent: <strong style={{ color: 'var(--red)' }}>{result.opponentPower}</strong>
            </p>
          </div>

          {/* Battle result */}
          <div className={`result-banner ${result.result}`} id="battle-result">
            <span className="result-emoji">
              {result.result === 'win' ? '🏆' : '💀'}
            </span>
            <div className="result-title">
              {result.result === 'win' ? 'Victory!' : 'Defeated!'}
            </div>
            <div className="result-detail">
              {result.result === 'win'
                ? `Your ${result.playerPower} power crushed the opponent's ${result.opponentPower}!`
                : `The opponent's ${result.opponentPower} power overwhelmed your ${result.playerPower}.`
              }
            </div>
            {result.score > 0 && (
              <div className="result-score">+{result.score} pts added to leaderboard 🎯</div>
            )}
          </div>

          {/* Post-battle actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { soundClick(); setResult(null); }} id="play-again-btn">
              ⚔️ Attack Again
            </button>
            <button className="btn btn-secondary" onClick={() => { soundClick(); navigate('/select'); }} id="change-character-btn">
              🔄 Change Character
            </button>
            <button className="btn btn-secondary" onClick={() => { soundClick(); navigate('/leaderboard'); }} id="view-leaderboard-btn">
              🏆 View Leaderboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default GamePage;
