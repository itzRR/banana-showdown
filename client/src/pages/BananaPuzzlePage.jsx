// ============================================================
//  BananaPuzzlePage — "Banana Trials" ⚡
//  Solve Banana API math puzzles to earn energy for The Arena.
//  Correct answer → +15⚡  |  Wrong answer → -10⚡
// ============================================================

import { useState, useCallback } from 'react';
import api from '../utils/api';
import { useEnergy } from '../context/EnergyContext';
import { soundSelect, soundClick, soundWin, soundLose } from '../utils/sounds';
import { playMusic, stopMusic, TRACKS } from '../utils/music';
import { useEffect } from 'react';

// Lore-flavored messages for correct/wrong answers
const CORRECT_MSGS = [
  "⚡ Charged! The bananas fuel your fury!",
  "⚡ The Oracle smiles — energy surges through you!",
  "⚡ Brilliant! Your lightning grows stronger!",
  "⚡ The Trials reward the worthy — power gained!",
  "⚡ Yes! The Banana Current flows in your veins!",
];
const WRONG_MSGS = [
  "💀 Misfired! The bananas mock your attempt.",
  "💀 The Oracle shakes its peel in disappointment.",
  "💀 Wrong! Your energy falters, warrior.",
  "💀 The bananas are unamused. Energy drained.",
  "💀 Your calculation crumbled — power lost!",
];

const ENERGY_GAIN   = 15;  // correct answer reward
const ENERGY_COST   = 10;  // wrong answer penalty

function BananaPuzzlePage() {
  const { energy, maxEnergy, addEnergy, spendEnergy } = useEnergy();

  const [puzzle, setPuzzle]       = useState(null);   // { question, solution }
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback]   = useState(null);   // { type:'correct'|'wrong', msg }
  const [energyAnim, setEnergyAnim] = useState(null); // 'gain' | 'drain'
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [answered, setAnswered]   = useState(false);

  // 🎵 Menu music on this page
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

  // Load puzzle on mount
  useEffect(() => { fetchPuzzle(); }, [fetchPuzzle]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!puzzle || answered || submitting) return;
    const answer = parseInt(userAnswer, 10);
    if (isNaN(answer)) return;

    setSubmitting(true);
    const isCorrect = answer === puzzle.solution;

    if (isCorrect) {
      soundWin();
      addEnergy(ENERGY_GAIN);
      setEnergyAnim('gain');
      setFeedback({
        type: 'correct',
        msg: CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)],
        delta: `+${ENERGY_GAIN}⚡`,
      });
    } else {
      soundLose();
      spendEnergy(ENERGY_COST);
      setEnergyAnim('drain');
      setFeedback({
        type: 'wrong',
        msg: WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)],
        delta: `-${ENERGY_COST}⚡`,
        correct: puzzle.solution,
      });
    }

    setAnswered(true);
    setSubmitting(false);
    // Clear animation class after it plays
    setTimeout(() => setEnergyAnim(null), 900);
  }

  const energyPct = Math.round((energy / maxEnergy) * 100);
  const energyColor = energy >= 60 ? 'var(--yellow)' : energy >= 25 ? 'var(--orange)' : 'var(--red)';

  return (
    <div className="page">
      {/* Background video */}
      <video className="bg-video" src="/characters/Bg.mp4" autoPlay muted loop playsInline />
      <div className="bg-video-overlay" />

      {/* Page header */}
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1>🧩 Banana Trials</h1>
        <p>Solve the Oracle's puzzles to charge your energy for <strong style={{ color: 'var(--yellow)' }}>The Arena</strong></p>
      </div>

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
        <div className="energy-bar-hint">
          {energy >= 15
            ? '🔋 Fully charged for battle!'
            : '⚠️ Low energy — keep solving to recharge!'}
        </div>
      </div>

      {/* ── Puzzle card ─────────────────────────────────── */}
      <div className="card puzzle-trial-card" style={{ marginTop: 24 }}>
        <div className="puzzle-trial-header">
          <h2>🍌 The Oracle Speaks</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Decipher the Banana equation. Answer correctly to charge your ⚡ energy.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" />
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>🍌 Summoning the Oracle's puzzle…</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>
        )}

        {puzzle && !loading && (
          <>
            {/* Puzzle image */}
            <div className="puzzle-trial-image-wrap">
              <img
                src={puzzle.question}
                alt="Banana Math Puzzle"
                className="puzzle-trial-image"
                id="banana-puzzle-image"
              />
              <div className="puzzle-trial-image-glow" />
            </div>

            {/* Answer form */}
            {!answered ? (
              <form onSubmit={handleSubmit} className="puzzle-trial-form">
                <label className="puzzle-trial-label">
                  What is the answer? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(0–9)</span>
                </label>
                <div className="puzzle-trial-input-row">
                  <input
                    id="puzzle-answer-input"
                    type="number"
                    min={0}
                    max={9}
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    className="form-input puzzle-trial-input"
                    placeholder="Enter 0 – 9"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    id="puzzle-submit-btn"
                    className="btn btn-primary"
                    disabled={submitting || userAnswer === ''}
                    onClick={soundClick}
                  >
                    ⚡ Submit
                  </button>
                </div>
              </form>
            ) : (
              /* Feedback block */
              <div className={`puzzle-trial-feedback ${feedback?.type}`}>
                <div className="puzzle-feedback-delta">{feedback?.delta}</div>
                <div className="puzzle-feedback-msg">{feedback?.msg}</div>
                {feedback?.type === 'wrong' && (
                  <div className="puzzle-feedback-correct">
                    The answer was <strong style={{ color: 'var(--yellow)' }}>{feedback.correct}</strong>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Next puzzle button */}
        {(answered || error) && !loading && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              id="next-puzzle-btn"
              className="btn btn-secondary"
              onClick={() => { soundSelect(); fetchPuzzle(); }}
            >
              🍌 Next Puzzle
            </button>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="card puzzle-trial-info" style={{ marginTop: 20 }}>
        <h3 style={{ color: 'var(--yellow)', marginBottom: 12 }}>⚡ How the Trials Work</h3>
        <div className="hiw-moves" style={{ flexWrap: 'wrap', gap: 12 }}>
          <span>✅ Correct <b>+{ENERGY_GAIN}⚡</b></span>
          <span>❌ Wrong <b style={{ color: 'var(--red)' }}>-{ENERGY_COST}⚡</b></span>
          <span>⚡ Max energy <b>{maxEnergy}⚡</b></span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 12 }}>
          Energy spent in The Arena on attacks. Use ⚔️ The Arena from the nav to enter battle!
        </p>
      </div>
    </div>
  );
}

export default BananaPuzzlePage;
