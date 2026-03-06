// ============================================================
//  Footer — Developed by credit with link
// ============================================================

import { useState, useRef } from 'react';

function Footer() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dodgeStyle, setDodgeStyle] = useState({ position: 'relative' });
  const modalRef = useRef(null);

  const handleDodgeHover = () => {
    const modal = modalRef.current;
    if (!modal) return;
    const { width, height } = modal.getBoundingClientRect();
    // Pick a random spot inside the modal, keeping the button (~160x40) in bounds
    const maxX = width - 170;
    const maxY = height - 50;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    setDodgeStyle({
      position: 'absolute',
      left: x,
      top: y,
      transition: 'left 0.15s ease, top 0.15s ease',
      zIndex: 10,
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
            style={{ position: 'relative', overflow: 'hidden' }}
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
