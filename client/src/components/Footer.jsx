// ============================================================
//  Footer — Developed by credit with link
// ============================================================

import { useState } from 'react';

function Footer() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

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
          onClick={() => setShowDisclaimer(true)}
        >
          Disclaimer & License
        </button>
      </footer>

      {showDisclaimer && (
        <div className="char-modal-backdrop" onClick={() => setShowDisclaimer(false)}>
          <div className="char-modal disclaimer-modal" onClick={e => e.stopPropagation()}>
            <button className="char-modal-close" onClick={() => setShowDisclaimer(false)}>✕</button>
            <div className="disclaimer-content">
              <h2 style={{ color: 'var(--yellow)', marginBottom: '16px' }}>Character Usage Disclaimer</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                <strong>Banana Showdown</strong> is a passion project and parody fighting game. All real-world individuals depicted as playable characters within this game have explicitly consented to have their likenesses, images, names, and videos used for the purposes of this application.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                Any resemblance to actual events, brands, or entities is entirely coincidental and for entertainment purposes only.
              </p>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowDisclaimer(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;
