// ============================================================
//  MusicManager — Singleton scene-music controller
//
//  Usage:
//    import { playMusic, stopMusic, toggleMute, isMuted } from './music';
//
//  Tracks:
//    /music/main menu.mp3           → login / register pages
//    /music/CHARACTERS selection.mp3 → character select page
//    /music/Battle Soundtrack.mp3   → game page
//    /music/Victory Theme.mp3       → call manually on win
// ============================================================

export const TRACKS = {
  MENU:      '/music/main menu.mp3',
  CHARACTER: '/music/CHARACTERS selection.mp3',
  BATTLE:    '/music/Battle Soundtrack.mp3',
  VICTORY:   '/music/Victory Theme.mp3',
};

// Shared Audio instance — reused to avoid multiple overlapping tracks
let currentAudio = null;
let currentSrc   = null;

// Mute state — persisted across page refreshes
let _muted = localStorage.getItem('bs_music_muted') === 'true';

// ── Internal helpers ──────────────────────────────────────

function applyMute(audio) {
  if (audio) audio.muted = _muted;
}

// ── Public API ────────────────────────────────────────────

/**
 * Play a track. If the same track is already playing, do nothing.
 * Stops the previous track first with a quick fade-out.
 */
export function playMusic(src) {
  if (currentSrc === src && currentAudio && !currentAudio.paused) return;

  // Stop previous
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audio      = new Audio(src);
  audio.loop       = true;
  audio.volume     = 0.15;
  audio.muted      = _muted;

  currentAudio = audio;
  currentSrc   = src;

  audio.play().catch(() => {
    // Autoplay blocked — browser will allow after first user interaction
  });
}

/**
 * Stop whatever is currently playing.
 */
export function stopMusic() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    currentSrc   = null;
  }
}

/**
 * Toggle global mute on/off. Returns the new muted state.
 */
export function toggleMute() {
  _muted = !_muted;
  localStorage.setItem('bs_music_muted', _muted);
  applyMute(currentAudio);
  return _muted;
}

/**
 * Current mute state.
 */
export function isMuted() {
  return _muted;
}
