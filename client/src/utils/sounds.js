// ============================================================
//  sounds.js — Web Audio API sound effects utility
//  All sounds are generated programmatically (no audio files needed)
// ============================================================

const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = null;

// Lazily create AudioContext (must be after a user gesture)
function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/**
 * Call this once after the very first user gesture (e.g. "Click to Start")
 * to prime the AudioContext so music/FX can auto-play afterwards.
 */
export function unlockAudio() {
  try { getCtx(); } catch (e) { /* ignore */ }
}

// Core helper: play an oscillator with optional frequency envelope
function playTone({ frequency = 440, type = 'sine', duration = 0.15, volume = 0.4,
  freqEnd = null, attack = 0.005, decay = 0.05, sustain = 0.3, release = 0.1 } = {}) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime);
    if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, ac.currentTime + duration);

    // Envelope
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ac.currentTime + attack);
    gain.gain.linearRampToValueAtTime(volume * sustain, ac.currentTime + attack + decay);
    gain.gain.setValueAtTime(volume * sustain, ac.currentTime + duration - release);
    gain.gain.linearRampToValueAtTime(0, ac.currentTime + duration);

    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (e) {
    // Silently fail if AudioContext unavailable
  }
}

// Helper: play multiple tones in sequence
function playSequence(notes) {
  notes.forEach(({ delay = 0, ...opts }) => {
    setTimeout(() => playTone(opts), delay * 1000);
  });
}

// ---- Public Sound Effects ----

// Short UI click — used for nav/button hover presses
export function soundClick() {
  playTone({ frequency: 800, type: 'sine', duration: 0.08, volume: 0.25, freqEnd: 600 });
}

// Character card selected — satisfying soft pop
export function soundSelect() {
  playTone({ frequency: 520, type: 'sine', duration: 0.12, volume: 0.3, freqEnd: 700 });
  setTimeout(() => playTone({ frequency: 900, type: 'sine', duration: 0.1, volume: 0.2 }), 80);
}

// Attack button — sharp percussive hit
export function soundAttack() {
  playTone({ frequency: 200, type: 'sawtooth', duration: 0.1, volume: 0.5, freqEnd: 80 });
  setTimeout(() => playTone({ frequency: 440, type: 'square', duration: 0.08, volume: 0.3 }), 60);
}

// Random Skill — magical shimmer
export function soundRandomSkill() {
  playSequence([
    { frequency: 600, type: 'sine', duration: 0.1, volume: 0.3, delay: 0 },
    { frequency: 800, type: 'sine', duration: 0.1, volume: 0.3, delay: 0.08 },
    { frequency: 1000, type: 'sine', duration: 0.1, volume: 0.3, delay: 0.16 },
    { frequency: 1200, type: 'sine', duration: 0.15, volume: 0.35, delay: 0.24 },
  ]);
}

// Banana Power — epic charge-up + impact
export function soundBananaPower() {
  // Rising charge
  playTone({ frequency: 100, type: 'sawtooth', duration: 0.4, volume: 0.4, freqEnd: 600, sustain: 0.5 });
  // Impact boom
  setTimeout(() => {
    playTone({ frequency: 300, type: 'square', duration: 0.25, volume: 0.6, freqEnd: 80 });
    playTone({ frequency: 1200, type: 'sine', duration: 0.3, volume: 0.35 });
  }, 380);
}

// Calling the oracle (loading) — three ascending pings
export function soundOracle() {
  playSequence([
    { frequency: 440, type: 'sine', duration: 0.15, volume: 0.25, delay: 0 },
    { frequency: 550, type: 'sine', duration: 0.15, volume: 0.25, delay: 0.18 },
    { frequency: 660, type: 'sine', duration: 0.2,  volume: 0.3,  delay: 0.36 },
  ]);
}

// Victory fanfare — triumphant ascending chord
export function soundWin() {
  playSequence([
    { frequency: 523, type: 'sine', duration: 0.15, volume: 0.5, delay: 0 },
    { frequency: 659, type: 'sine', duration: 0.15, volume: 0.5, delay: 0.12 },
    { frequency: 784, type: 'sine', duration: 0.15, volume: 0.5, delay: 0.24 },
    { frequency: 1047, type: 'sine', duration: 0.35, volume: 0.55, delay: 0.36 },
  ]);
}

// Defeat — descending sad wail
export function soundLose() {
  playSequence([
    { frequency: 400, type: 'sine', duration: 0.2, volume: 0.4, delay: 0 },
    { frequency: 320, type: 'sine', duration: 0.2, volume: 0.4, delay: 0.18 },
    { frequency: 240, type: 'sine', duration: 0.35, volume: 0.4, freqEnd: 160, delay: 0.36 },
  ]);
}

// Leaderboard page load — quick fanfare
export function soundLeaderboard() {
  playSequence([
    { frequency: 784, type: 'sine', duration: 0.1, volume: 0.3, delay: 0 },
    { frequency: 1047, type: 'sine', duration: 0.15, volume: 0.35, delay: 0.1 },
  ]);
}

// Character card hover — subtle soft tick
export function soundHover() {
  playTone({ frequency: 660, type: 'sine', duration: 0.07, volume: 0.15, freqEnd: 720 });
}

// Play fight.mp3 — fired when the Battle confirm button is clicked
let fightAudio = null;
export function soundFight() {
  try {
    // Stop any previous instance
    if (fightAudio) { fightAudio.pause(); fightAudio.currentTime = 0; }
    fightAudio = new Audio('/music/fight.mp3');
    fightAudio.volume = 0.55;
    fightAudio.play().catch(() => {});
  } catch (e) { /* ignore */ }
}
