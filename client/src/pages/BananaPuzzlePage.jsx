// ============================================================
//  BananaPuzzlePage — "Banana Trials" ⚡
//  Premium redesign: immersive oracle theme, big puzzle display,
//  animated energy orb, stylish digit selector, rich feedback.
//  Correct answer → +15⚡  |  Wrong answer → -10⚡
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { useEnergy } from '../context/EnergyContext';
import { soundSelect, soundClick, soundHover, soundWin, soundLose } from '../utils/sounds';
import { playMusic, stopMusic, TRACKS } from '../utils/music';

const CORRECT_MSGS = [
  "The Oracle smiles — energy surges through you!",
  "Brilliant! The Banana Current flows in your veins!",
  "The Trials reward the worthy — power gained!",
  "Your lightning grows stronger, champion!",
  "Perfect! The bananas fuel your fury!",
];
const WRONG_MSGS = [
  "The Oracle shakes its peel in disappointment.",
  "Misfired! The bananas mock your attempt.",
  "Your calculation crumbled — power lost!",
  "The bananas are unamused. Energy drained.",
  "Wrong path, warrior. Your energy falters.",
];

const ENERGY_GAIN = 15;
const ENERGY_COST = 10;

// Digit selector buttons 0–9 instead of a plain input
function DigitPad({ value, onChange, disabled }) {
  return (
    <div className="digit-pad">
      {Array.from({ length: 10 }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`digit-btn${value === String(i) ? ' digit-btn-active' : ''}`}
          onClick={() => { soundClick(); onChange(String(i)); }}
          onMouseEnter={soundHover}
          disabled={disabled}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

function BananaPuzzlePage() {
  const { energy, maxEnergy, addEnergy, spendEnergy } = useEnergy();

  const [puzzle, setPuzzle]         = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback]     = useState(null);
  const [energyAnim, setEnergyAnim] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [answered, setAnswered]     = useState(false);
  const [streak, setStreak] = useState(() => {
    const saved = parseInt(localStorage.getItem('bs_streak'), 10);
    return isNaN(saved) ? 0 : saved;
  });
  // Persist streak across refreshes
  useEffect(() => {
    localStorage.setItem('bs_streak', String(streak));
  }, [streak]);

  useEffect(() => {
    playMusic(TRACKS.MENU);
    return () => stopMusic();
  }, []);

  const fetchPuzzle = useCallback(async () => {
    setLoading(true);
    setError('');
    setFeedback(null);
    setUserAnswer('');
    setAnswered(false);
    setEnergyAnim(null);
    try {
      const res = await api.get('/api/puzzle');
      setPuzzle(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reach the Banana Oracle. Try again!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPuzzle(); }, [fetchPuzzle]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!puzzle || answered || submitting || userAnswer === '') return;
    const answer = parseInt(userAnswer, 10);
    if (isNaN(answer)) return;

    setSubmitting(true);
    const isCorrect = answer === puzzle.solution;

    if (isCorrect) {
      soundWin();
      addEnergy(ENERGY_GAIN);
      setEnergyAnim('gain');
      setStreak(s => s + 1);
      setFeedback({
        type: 'correct',
        msg: CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)],
        delta: `+${ENERGY_GAIN}⚡`,
      });
    } else {
      soundLose();
      spendEnergy(ENERGY_COST);
      setEnergyAnim('drain');
      setStreak(0);
      setFeedback({
        type: 'wrong',
        msg: WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)],
        delta: `-${ENERGY_COST}⚡`,
        correct: puzzle.solution,
      });
    }

    setAnswered(true);
    setSubmitting(false);
    setTimeout(() => setEnergyAnim(null), 900);
  }

  const energyPct   = Math.round((energy / maxEnergy) * 100);
  const energyColor = energy >= 60 ? '#ffd633' : energy >= 25 ? '#ff8c42' : '#ff4757';
  const energyStatus = energy >= 80
    ? '⚡ Unstoppable — enter The Arena now!'
    : energy >= 60
    ? '🍌 Power surging — The Oracle is pleased.'
    : energy >= 40
    ? '⚡ Storm building… keep solving, warrior.'
    : energy >= 15
    ? '💀 The dark drains you — solve more trials!'
    : '🔴 Critical charge — the Arena will deny you!';

  return (
    <div className="page trials-page">
      {/* Background */}
      <video className="bg-video" src="/characters/Bg.mp4" autoPlay muted loop playsInline />
      <div className="bg-video-overlay" />

      {/* ── HERO HEADER ─────────────────────────────────── */}
      <div className="trials-hero">
        <div className="trials-hero-badge">BANANA TRIALS</div>
        <h1 className="trials-hero-title">
          <span className="trials-hero-icon">🧩</span>
          The Oracle's Chamber
        </h1>
        <p className="trials-hero-sub">
          Solve the sacred equations — earn <span className="trials-accent">⚡ energy</span> to dominate The Arena
        </p>
      </div>

      <div className="trials-layout">

        {/* ── LEFT: Energy Dashboard ─────────────────────── */}
        <div className="trials-sidebar">

          {/* Energy Orb */}
          <div className={`trials-energy-card${energyAnim ? ` energy-${energyAnim}` : ''}`}>
            <div className="trials-energy-orb-wrap">
              <svg className="trials-energy-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={energyColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - energyPct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease', transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
                />
              </svg>
              <div className="trials-energy-orb-inner">
                <div className="trials-energy-number" style={{ color: energyColor }}>{energy}</div>
                <div className="trials-energy-max">/ {maxEnergy}</div>
                <div className="trials-energy-bolt">⚡</div>
              </div>
            </div>
            <div className="trials-energy-status" style={{ color: energyColor }}>{energyStatus}</div>
            <div className="trials-energy-label">Battle Energy</div>
          </div>

          {/* Streak counter */}
          <div className="trials-streak-card">
            <div className="trials-streak-num" style={{ color: streak > 0 ? '#ffd633' : 'var(--text-muted)' }}>
              {streak}
            </div>
            <div className="trials-streak-label">🔥 Streak</div>
          </div>

          {/* Rules card */}
          <div className="trials-rules-card">
            <div className="trials-rules-title">Trial Rules</div>
            <div className="trials-rule correct">
              <span className="trials-rule-icon">✓</span>
              <span>Correct</span>
              <span className="trials-rule-val">+{ENERGY_GAIN}⚡</span>
            </div>
            <div className="trials-rule wrong">
              <span className="trials-rule-icon">✗</span>
              <span>Wrong</span>
              <span className="trials-rule-val">−{ENERGY_COST}⚡</span>
            </div>
            <div className="trials-rule neutral">
              <span className="trials-rule-icon">⚡</span>
              <span>Maximum</span>
              <span className="trials-rule-val">{maxEnergy}⚡</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Puzzle Area ──────────────────────────── */}
        <div className="trials-main">

          {/* Oracle header */}
          <div className="trials-oracle-header">
            <span className="trials-oracle-icon">🍌</span>
            <div>
              <div className="trials-oracle-title">The Oracle Speaks</div>
              <div className="trials-oracle-sub">What number does the equation reveal?</div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="trials-loading">
              <div className="trials-spinner">
                <span>🍌</span>
              </div>
              <p>Summoning the Oracle's wisdom…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-error trials-error">{error}</div>
          )}

          {/* Puzzle + Answer */}
          {puzzle && !loading && (
            <div className="trials-puzzle-area">
              {/* Puzzle image */}
              <div className={`trials-puzzle-frame${answered && feedback?.type === 'correct' ? ' frame-correct' : answered && feedback?.type === 'wrong' ? ' frame-wrong' : ''}`}>
                <div className="trials-puzzle-corners">
                  <span/><span/><span/><span/>
                </div>
                <img
                  src={puzzle.question}
                  alt="Banana Math Puzzle"
                  className="trials-puzzle-img"
                  id="banana-puzzle-image"
                />
                <div className="trials-puzzle-scanline" />
              </div>

              {/* Answer section */}
              {!answered ? (
                <form onSubmit={handleSubmit} className="trials-answer-form">
                  <div className="trials-answer-label">Choose Your Answer</div>
                  <DigitPad value={userAnswer} onChange={setUserAnswer} disabled={submitting} />
                  <div className="trials-selected-display">
                    {userAnswer !== ''
                      ? <span>Selected: <strong style={{ color: 'var(--yellow)', fontSize: '1.4rem' }}>{userAnswer}</strong></span>
                      : <span style={{ color: 'var(--text-muted)' }}>Tap a digit above</span>
                    }
                  </div>
                  <button
                    type="submit"
                    id="puzzle-submit-btn"
                    className="btn trials-submit-btn"
                    disabled={submitting || userAnswer === ''}
                  >
                    <span>⚡</span>
                    <span>Confirm Answer</span>
                  </button>
                </form>
              ) : (
                /* Feedback */
                <div className={`trials-feedback ${feedback?.type}`}>
                  <div className="trials-feedback-delta">{feedback?.delta}</div>
                  <div className="trials-feedback-icon">
                    {feedback?.type === 'correct' ? '🏆' : '💀'}
                  </div>
                  <div className="trials-feedback-msg">{feedback?.msg}</div>
                  {feedback?.type === 'wrong' && (
                    <div className="trials-feedback-reveal">
                      The answer was <strong>{feedback.correct}</strong>
                    </div>
                  )}
                  <button
                    id="next-puzzle-btn"
                    className="btn trials-next-btn"
                    onClick={() => { soundSelect(); fetchPuzzle(); }}
                  >
                    🍌 Next Trial
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BananaPuzzlePage;
