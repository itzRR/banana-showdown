// ============================================================
//  GamePage — Core gameplay: action buttons → Banana API → result
//  [EVENT-DRIVEN] — Button clicks trigger handleAction event
//  [API INTEROPERABILITY] — axios.post('/api/game/play') calls backend
//                           which then calls the Banana API
//  Boss is revealed via a slot-machine spin animation on page load.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  soundAttack, soundRandomSkill, soundBananaPower,
  soundOracle, soundWin, soundLose, soundClick, soundHover
} from '../utils/sounds';
import { playMusic, stopMusic, TRACKS } from '../utils/music';

// All available Banana Bosses (image + name pairs)
const BOSSES = [
  { image: '/characters/banana boss.webp',  name: 'General Malinda – King of the Arena' },
  { image: '/characters/banana boss2.webp', name: 'Raj The Ripper' },
  { image: '/characters/banana boss3.webp', name: 'Overlord Vinura' },
  { image: '/characters/banana boss4.webp', name: 'Gota the Imperator' },
  { image: '/characters/banana boss5.webp', name: 'Don Sunil "The Golden Peel"' },
];
const BOSS_IMAGES = BOSSES.map(b => b.image);

// ── SlotMachineBoss ────────────────────────────────────────────
// A true slot-machine reel: images physically scroll upward through a
// clipped viewport, decelerating step-by-step before locking on the winner.
function SlotMachineBoss({ onDone, onBossSelected }) {
  const IMG_H = 130; // px — matches slot window height
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Pick the final boss ONCE, randomly
  const finalImgRef = useRef(BOSS_IMAGES[Math.floor(Math.random() * BOSS_IMAGES.length)]);

  // Build the reel strip:  5 repeats × 5 images + the chosen image at the very end
  // This guarantees we never run out of images while scrolling
  const reel = [...BOSS_IMAGES, ...BOSS_IMAGES, ...BOSS_IMAGES, ...BOSS_IMAGES, ...BOSS_IMAGES, finalImgRef.current];

  // Random start index (0–4) so the reel never visually begins at the same image
  const startIdx = useRef(Math.floor(Math.random() * BOSS_IMAGES.length));

  // Scroll position (translateY) and CSS transition duration (ms)
  const [scrollY,  setScrollY]  = useState(startIdx.current * IMG_H);
  const [duration, setDuration] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    const timers = [];
    const N = BOSS_IMAGES.length; // 5
    let idx   = startIdx.current;
    let time  = 0;

    // ── Fast phase: 15 steps @ 65 ms each ──────────────────────
    const FAST_STEPS = 15;
    const FAST_MS    = 65;
    for (let i = 0; i < FAST_STEPS; i++) {
      idx++;
      const y = idx * IMG_H;
      const delay = time;
      timers.push(setTimeout(() => {
        setDuration(FAST_MS - 5);
        setScrollY(y);
      }, delay));
      time += FAST_MS;
    }

    // ── Slow phase: 6 steps with increasing gap ─────────────────
    const slowGaps = [120, 170, 220, 280, 340, 410];
    for (let i = 0; i < slowGaps.length; i++) {
      idx++;
      const y = idx * IMG_H;
      const gap = slowGaps[i];
      const delay = time;
      timers.push(setTimeout(() => {
        setDuration(gap - 15);
        setScrollY(y);
      }, delay));
      time += gap;
    }

    // ── Land: snap to the final image with a smooth ease-out ────
    const finalY = (reel.length - 1) * IMG_H;
    timers.push(setTimeout(() => {
      setDuration(420);
      setScrollY(finalY);
      setSpinning(false);
    }, time));

    // ── Reveal flash + notify parent ────────────────────────────
    timers.push(setTimeout(() => {
      setRevealed(true);
      const selectedBoss = BOSSES.find(b => b.image === finalImgRef.current) || BOSSES[0];
      onBossSelected && onBossSelected(selectedBoss);
      onDoneRef.current && onDoneRef.current();
    }, time + 440));

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`slot-boss-window${revealed ? ' revealed' : ''}`}>
      {/* The reel strip — scrolls upward */}
      <div
        className="slot-boss-reel"
        style={{
          transform: `translateY(-${scrollY}px)`,
          transition: `transform ${duration}ms linear`,
        }}
      >
        {reel.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Boss"
            className="slot-reel-img"
          />
        ))}
      </div>

      {/* "Picking Boss…" label during spin */}
      {spinning && (
        <div className="slot-spin-overlay">
          <span className="slot-spin-text">🎰 Picking Boss…</span>
        </div>
      )}

      {/* Flash on reveal */}
      {revealed && <div className="slot-reveal-flash" />}
    </div>
  );
}

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
  const [bossReady, setBossReady] = useState(false);
  const [boss, setBoss] = useState(null);
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
      {/* ── Background video (PC only) ─────────────────── */}
      <video
        className="bg-video"
        src="/characters/Bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="bg-video-overlay" />

      <div className="page-header">
        <h1>⚔️ Battle Arena</h1>
        <p>Playing as <strong style={{ color: 'var(--yellow)' }}>{character.name}</strong> — Choose your move!</p>
      </div>

      {/* Fighter cards */}
      <div className="game-layout">
        {/* Player */}
        <div className="card fighter-panel player-panel">
          {character.image
            ? <img src={character.image} alt={character.name}
                style={{ width: 130, height: 130, objectFit: 'cover', objectPosition: 'top',
                         borderRadius: 14, marginBottom: 12, border: '2px solid var(--border-bright)' }} />
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
        <div className="vs-divider card" style={{ flexDirection: 'column', gap: 8, minWidth: 90, padding: '24px 16px' }}>
          <span className="vs-bolt">⚡</span>
          <span className="vs-text">VS</span>
          <span className="vs-bolt">⚡</span>
        </div>

        {/* Opponent — slot machine reveal */}
        <div className="card fighter-panel opponent-panel">
          <SlotMachineBoss
            onDone={() => setBossReady(true)}
            onBossSelected={setBoss}
          />
          <div className="fighter-label" style={{ marginTop: 12 }}>Opponent</div>
          <div className="fighter-name">{boss ? boss.name : 'Banana Boss'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            Boss
          </div>
          <div className="power-bar-wrapper">
            <div className="power-bar-label">
              <span>Power</span>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>
                {result ? result.opponentPower : (bossReady ? '???' : '🎰')}
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
            onMouseEnter={soundHover}
            disabled={loading || !bossReady}
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
            onMouseEnter={soundHover}
            disabled={loading || !bossReady}
            title="Random skill — 1.25x power multiplier"
          >
            <span className="action-icon">🎲</span>
            <span>Random Skill</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1.25x power</span>
          </button>

          {/* [EVENT] Banana Power — ultimate move */}
          <button
            id="btn-banana-power"
            className="action-btn banana-power"
            onClick={() => handleAction('bananaPower')}
            onMouseEnter={soundHover}
            disabled={loading || !bossReady}
            title="Banana Power ultimate — 1.5x power multiplier"
          >
            <span className="action-icon">🍌</span>
            <span>Banana Power</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1.5x power</span>
          </button>
        </div>
        {!bossReady && (
          <p style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🎰 Waiting for the boss to be revealed…
          </p>
        )}
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
            <div className="puzzle-answer" style={{ flexDirection: 'column', gap: 8 }}>
              <div>
                <span className="puzzle-answer-label">Solution modifier:</span>
                <span className="puzzle-answer-number" id="banana-solution">{result.bananaNumber}</span>
              </div>
              
              <div style={{
                background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: 8,
                fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 12,
                border: '1px solid var(--border)'
              }}>
                <div style={{ marginBottom: 4, color: 'var(--text-primary)', fontWeight: 600 }}>Final Power Calculation:</div>
                <div>
                  ( <span style={{color:'var(--text-primary)'}}>{character.basePower} Base</span> +&nbsp;
                  <span style={{color:'var(--yellow)'}}>{result.bananaNumber} × 10 Banana</span> )
                  × <span style={{color:'var(--orange)'}}>{result.multiplier} Multiplier</span>
                  &nbsp;=&nbsp; <strong style={{color:'var(--yellow)', fontSize:'1.1rem'}}>{result.playerPower} Power</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Battle result */}
          <div className={`result-banner ${result.result}`} id="battle-result" ref={resultRef}>
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
          <div className="post-battle-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
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
