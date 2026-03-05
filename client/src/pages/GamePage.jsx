// ============================================================
//  GamePage — The Arena: energy-based battle
//  ⚡ Energy costs: Attack=5  Random Skill=10  Banana Power=15
//  Power formula: Math.floor(basePower * multiplier) + random(0-50)
//  No Banana puzzle shown here — that's Banana Trials (/puzzle)
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useEnergy } from '../context/EnergyContext';
import {
  soundAttack, soundRandomSkill, soundBananaPower,
  soundOracle, soundWin, soundLose, soundClick, soundHover
} from '../utils/sounds';
import { playMusic, stopMusic, TRACKS } from '../utils/music';

// All available Banana Bosses (image + name pairs)
const BOSSES = [
  { image: '/characters/banana%20boss.webp',  name: 'General Malinda – King of the Arena' },
  { image: '/characters/banana%20boss2.webp', name: 'Raj The Ripper' },
  { image: '/characters/banana%20boss3.webp', name: 'Overlord Vinura' },
  { image: '/characters/banana%20boss4.webp', name: 'Gota the Imperator' },
  { image: '/characters/banana%20boss5.webp', name: 'Don Sunil "The Golden Peel"' },
];
const BOSS_IMAGES = BOSSES.map(b => b.image);

// Energy costs per action
const ENERGY_COSTS = {
  attack:      5,
  randomSkill: 10,
  bananaPower: 15,
};

// Creative low-energy popup messages matching the game's lore
const LOW_ENERGY_MSGS = [
  { title: "⚡ Your spark dims, warrior!", body: "The Arena hungers for energy. Return to the Banana Trials to recharge your fury!" },
  { title: "⚡ Lightning fading fast…", body: "Your power flickers like a dying storm. Seek the Trials — the bananas hold your charge!" },
  { title: "⚡ Not enough voltage!", body: "This move demands more than your feeble current. Charge up in Banana Trials, then return!" },
  { title: "⚡ The Peels mock you.", body: "Even the boss laughs at your drained state. Solve the Oracle's puzzles and come back stronger!" },
  { title: "⚡ Insufficient energy!", body: "The Arena's gates stay shut to the powerless. Fuel your ⚡ in Banana Trials first!" },
];

// ── SlotMachineBoss ────────────────────────────────────────────
function SlotMachineBoss({ onDone, onBossSelected }) {
  const IMG_H = 130;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const finalImgRef = useRef(BOSS_IMAGES[Math.floor(Math.random() * BOSS_IMAGES.length)]);
  const reel = [...BOSS_IMAGES, ...BOSS_IMAGES, ...BOSS_IMAGES, ...BOSS_IMAGES, ...BOSS_IMAGES, finalImgRef.current];
  const startIdx = useRef(Math.floor(Math.random() * BOSS_IMAGES.length));

  const [scrollY,  setScrollY]  = useState(startIdx.current * IMG_H);
  const [duration, setDuration] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    const timers = [];
    let idx  = startIdx.current;
    let time = 0;

    const FAST_STEPS = 15;
    const FAST_MS    = 65;
    for (let i = 0; i < FAST_STEPS; i++) {
      idx++;
      const y = idx * IMG_H;
      const delay = time;
      timers.push(setTimeout(() => { setDuration(FAST_MS - 5); setScrollY(y); }, delay));
      time += FAST_MS;
    }

    const slowGaps = [120, 170, 220, 280, 340, 410];
    for (let i = 0; i < slowGaps.length; i++) {
      idx++;
      const y = idx * IMG_H;
      const gap = slowGaps[i];
      const delay = time;
      timers.push(setTimeout(() => { setDuration(gap - 15); setScrollY(y); }, delay));
      time += gap;
    }

    const finalY = (reel.length - 1) * IMG_H;
    timers.push(setTimeout(() => { setDuration(420); setScrollY(finalY); setSpinning(false); }, time));

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
      <div
        className="slot-boss-reel"
        style={{ transform: `translateY(-${scrollY}px)`, transition: `transform ${duration}ms linear` }}
      >
        {reel.map((src, i) => (
          <img key={i} src={src} alt="Boss" className="slot-reel-img" />
        ))}
      </div>
      {spinning && (
        <div className="slot-spin-overlay">
          <span className="slot-spin-text">🎰 Picking Boss…</span>
        </div>
      )}
      {revealed && <div className="slot-reveal-flash" />}
    </div>
  );
}

// ── LowEnergyPopup ─────────────────────────────────────────────
function LowEnergyPopup({ msg, onClose, onGoToTrials }) {
  return (
    <div className="low-energy-overlay" onClick={onClose}>
      <div className="low-energy-popup" onClick={e => e.stopPropagation()}>
        <div className="low-energy-bolt">⚡</div>
        <div className="low-energy-title">{msg.title}</div>
        <div className="low-energy-body">{msg.body}</div>
        <div className="low-energy-actions">
          <button className="btn btn-primary" onClick={onGoToTrials} id="go-to-trials-btn">
            🧩 Go to Banana Trials
          </button>
          <button className="btn btn-secondary" onClick={onClose} id="close-energy-popup-btn">
            Stay Here
          </button>
        </div>
      </div>
    </div>
  );
}

function GamePage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { energy, maxEnergy, spendEnergy, canAfford } = useEnergy();

  const character = location.state?.character;

  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [error, setError]               = useState('');
  const [bossReady, setBossReady]       = useState(false);
  const [boss, setBoss]                 = useState(null);
  const [energyAnim, setEnergyAnim]     = useState(null); // 'gain' | 'drain'
  const [lowEnergyMsg, setLowEnergyMsg] = useState(null); // popup msg or null
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

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [result]);

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

  // Energy bar
  const energyPct   = Math.round((energy / maxEnergy) * 100);
  const energyColor = energy >= 60 ? 'var(--yellow)' : energy >= 25 ? 'var(--orange)' : 'var(--red)';

  // -------------------------------------------------------
  // [EVENT HANDLER] — Attack / Random Skill / Banana Power
  // -------------------------------------------------------
  async function handleAction(action) {
    const cost = ENERGY_COSTS[action];

    // Check energy — show lore popup if too low
    if (!canAfford(cost)) {
      const msg = LOW_ENERGY_MSGS[Math.floor(Math.random() * LOW_ENERGY_MSGS.length)];
      setLowEnergyMsg(msg);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    playMusic(TRACKS.BATTLE);

    if (action === 'attack')       soundAttack();
    if (action === 'randomSkill')  soundRandomSkill();
    if (action === 'bananaPower')  soundBananaPower();

    try {
      setTimeout(soundOracle, 450);

      const res = await api.post(
        '/api/game/play',
        { character: { name: character.name, basePower: character.basePower }, action }
      );

      // Spend energy on success
      spendEnergy(cost);
      setEnergyAnim('drain');
      setTimeout(() => setEnergyAnim(null), 900);

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
      {/* Background video */}
      <video className="bg-video" src="/characters/Bg.mp4" autoPlay muted loop playsInline />
      <div className="bg-video-overlay" />

      {/* ── Energy bar ─────────────────────────────────── */}
      <div className={`energy-bar-panel${energyAnim ? ` energy-${energyAnim}` : ''}`}>
        <div className="energy-bar-header">
          <span className="energy-bar-label">⚡ Battle Energy</span>
          <span className="energy-bar-value" style={{ color: energyColor }}>
            {energy} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {maxEnergy}</span>
          </span>
        </div>
        <div className="energy-bar-track">
          <div
            className="energy-bar-fill"
            style={{ width: `${energyPct}%`, background: `linear-gradient(90deg, ${energyColor}, var(--yellow))` }}
          />
        </div>
        {energy < 15 && (
          <div className="energy-bar-hint" style={{ color: 'var(--red)' }}>
            ⚠️ Critical energy! Go to Banana Trials to recharge.
          </div>
        )}
      </div>

      <div className="page-header">
        <h1>⚔️ The Arena</h1>
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
              <div className="power-bar-fill player" style={{ width: `${playerBarWidth}%` }} />
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
          <SlotMachineBoss onDone={() => setBossReady(true)} onBossSelected={setBoss} />
          <div className="fighter-label" style={{ marginTop: 12 }}>Opponent</div>
          <div className="fighter-name">{boss ? boss.name : 'Banana Boss'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>Boss</div>
          <div className="power-bar-wrapper">
            <div className="power-bar-label">
              <span>Power</span>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>
                {result ? result.opponentPower : (bossReady ? '???' : '🎰')}
              </span>
            </div>
            <div className="power-bar-track">
              <div className="power-bar-fill opponent" style={{ width: `${opponentBarWidth}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="card action-panel" style={{ marginTop: 24 }}>
        <h3>Choose Your Move</h3>
        <div className="action-buttons">
          {/* Attack */}
          <button
            id="btn-attack"
            className={`action-btn attack${!canAfford(ENERGY_COSTS.attack) ? ' btn-energy-low' : ''}`}
            onClick={() => handleAction('attack')}
            onMouseEnter={soundHover}
            disabled={loading || !bossReady}
            title={`Standard attack — costs ${ENERGY_COSTS.attack}⚡`}
          >
            <span className="action-icon">⚔️</span>
            <span>Attack</span>
            <span className="action-energy-cost">⚡{ENERGY_COSTS.attack}</span>
          </button>

          {/* Random Skill */}
          <button
            id="btn-random-skill"
            className={`action-btn random-skill${!canAfford(ENERGY_COSTS.randomSkill) ? ' btn-energy-low' : ''}`}
            onClick={() => handleAction('randomSkill')}
            onMouseEnter={soundHover}
            disabled={loading || !bossReady}
            title={`Random skill — costs ${ENERGY_COSTS.randomSkill}⚡`}
          >
            <span className="action-icon">🎲</span>
            <span>Random Skill</span>
            <span className="action-energy-cost">⚡{ENERGY_COSTS.randomSkill}</span>
          </button>

          {/* Banana Power */}
          <button
            id="btn-banana-power"
            className={`action-btn banana-power${!canAfford(ENERGY_COSTS.bananaPower) ? ' btn-energy-low' : ''}`}
            onClick={() => handleAction('bananaPower')}
            onMouseEnter={soundHover}
            disabled={loading || !bossReady}
            title={`Banana Power ultimate — costs ${ENERGY_COSTS.bananaPower}⚡`}
          >
            <span className="action-icon">🍌</span>
            <span>Banana Power</span>
            <span className="action-energy-cost">⚡{ENERGY_COSTS.bananaPower}</span>
          </button>
        </div>
        {!bossReady && (
          <p style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🎰 Waiting for the boss to be revealed…
          </p>
        )}
      </div>

      {/* How It Works */}
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
            <h3 style={{ marginBottom: 16, color: 'var(--yellow)' }}>⚔️ How The Arena Works</h3>
            <div className="hiw-steps">
              <div className="hiw-step">
                <div className="hiw-step-num">1</div>
                <div>
                  <strong>Earn energy in Banana Trials 🧩</strong>
                  <p>Solve the Oracle's puzzle to gain ⚡ energy. You need energy to attack!</p>
                </div>
              </div>
              <div className="hiw-step">
                <div className="hiw-step-num">2</div>
                <div>
                  <strong>Pick your move</strong>
                  <p>Each move costs energy and has a different power multiplier:</p>
                  <div className="hiw-moves">
                    <span>⚔️ Attack &nbsp;<b>×1.0</b> &nbsp;— 5⚡</span>
                    <span>🎲 Random Skill &nbsp;<b>×1.25</b> &nbsp;— 10⚡</span>
                    <span>🍌 Banana Power &nbsp;<b>×1.5</b> &nbsp;— 15⚡</span>
                  </div>
                </div>
              </div>
              <div className="hiw-step">
                <div className="hiw-step-num">3</div>
                <div>
                  <strong>Your power is calculated</strong>
                  <div className="hiw-formula">
                    Your Power = floor( Base Power × Multiplier ) + Lucky Bonus (0–50)
                  </div>
                </div>
              </div>
              <div className="hiw-step">
                <div className="hiw-step-num">4</div>
                <div>
                  <strong>Beat the opponent to win!</strong>
                  <p>
                    The opponent has a <b>random power between 70–160</b>.
                    If <span style={{ color: 'var(--yellow)' }}>Your Power</span> &gt; <span style={{ color: 'var(--red)' }}>Opponent Power</span> → 🏆 Victory!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card loading-overlay" style={{ marginTop: 24 }}>
          <div className="spinner" />
          <p>Channeling your battle energy… ⚡</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>
      )}

      {/* Battle result */}
      {result && (
        <>
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
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
              Base ×{result.multiplier} + {result.luckyBonus} Lucky Bonus = {result.playerPower} Power
            </div>
            {result.score > 0 && (
              <div className="result-score">+{result.score} pts added to leaderboard 🎯</div>
            )}
          </div>

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
            <button className="btn btn-secondary" onClick={() => { soundClick(); navigate('/puzzle'); }} id="go-recharge-btn">
              🧩 Recharge Energy
            </button>
          </div>
        </>
      )}

      {/* Low-energy popup */}
      {lowEnergyMsg && (
        <LowEnergyPopup
          msg={lowEnergyMsg}
          onClose={() => setLowEnergyMsg(null)}
          onGoToTrials={() => { soundClick(); navigate('/puzzle'); }}
        />
      )}
    </div>
  );
}

export default GamePage;
