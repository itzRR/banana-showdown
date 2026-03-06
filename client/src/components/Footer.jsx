// ============================================================
//  Footer — Developed by credit with link
// ============================================================

import { useState, useRef } from 'react';

function Footer() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dodgeStyle, setDodgeStyle] = useState({ position: 'relative' });
  const modalRef = useRef(null);

  const playBoingSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const sounds = [
        // 1. Descending boing
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(900, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.35, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.45);
        },
        // 2. Wobbly spring
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.setValueAtTime(600, ctx.currentTime + 0.05);
          osc.frequency.setValueAtTime(200, ctx.currentTime + 0.10);
          osc.frequency.setValueAtTime(500, ctx.currentTime + 0.15);
          osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
        },
        // 3. Low "nope" honk
        () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, ctx.currentTime);
          osc.frequency.setValueAtTime(140, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        },
      ];
      sounds[Math.floor(Math.random() * sounds.length)]();
    } catch (_) { /* silence on unsupported browsers */ }
  };

  const handleDodgeHover = () => {
    playBoingSound();
    // Roam the entire screen using fixed positioning
    const btnW = 180;
    const btnH = 44;
    const maxX = window.innerWidth - btnW;
    const maxY = window.innerHeight - btnH;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    setDodgeStyle({
      position: 'fixed',
      left: x,
      top: y,
      transition: 'left 0.15s ease, top 0.15s ease',
      zIndex: 9999,
    });
  };

  return (
    <>
      <footer className="app-footer">
        <span>Developed by </span>
        <a
          href="https://r2-vision.firebaseapp.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Rehan Bandara
        </a>
        <span> · <img src="/favicon-96x96.png" alt="logo" style={{ width: 16, height: 16, borderRadius: 4, verticalAlign: 'middle', marginRight: 4 }} />Banana Showdown</span>
        <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.2)' }}>|</span>
        <button 
          className="footer-disclaimer-btn" 
          onClick={() => { setShowDisclaimer(true); setDodgeStyle({ position: 'relative' }); }}
        >
          Disclaimer &amp; License
        </button>
      </footer>

      {showDisclaimer && (
        <div className="char-modal-backdrop" onClick={() => setShowDisclaimer(false)}>
          <div
            className="char-modal disclaimer-modal"
            ref={modalRef}
            onClick={e => e.stopPropagation()}
          >
            <button className="char-modal-close" onClick={() => setShowDisclaimer(false)}>✕</button>
            <div className="disclaimer-content">
              <h2 style={{ color: 'var(--yellow)', marginBottom: '16px' }}>Character Usage Disclaimer</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                <strong>Banana Showdown</strong> is a passion project and parody fighting game. All real-world individuals depicted as playable characters within this game have explicitly consented to have their likenesses, images, names, and videos used for the purposes of this application.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                Any resemblance to actual events, brands, or entities is entirely coincidental and for entertainment purposes only.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '12px' }}
                onClick={() => setShowDisclaimer(false)}
              >
                I Understand
              </button>
              {/* Joke button — runs away on hover */}
              <button
                className="btn"
                style={{
                  ...dodgeStyle,
                  background: 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.45)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'not-allowed',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={handleDodgeHover}
                onClick={e => e.preventDefault()}
                title="lol no"
              >
                I Don&apos;t Understand 🤔
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;
