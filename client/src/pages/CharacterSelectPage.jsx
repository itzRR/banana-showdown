// ============================================================
//  CharacterSelectPage — Pick your fighter
//  Each character: name, alias, avatar emoji, image, intro video,
//  base power, class, and description.
//  To add media: set `image` to an import / URL and `video` to a
//  video URL. Cards show the image (fallback: emoji) and play the
//  video on hover.
// ============================================================

import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundSelect, soundClick } from '../utils/sounds';
import { playMusic, stopMusic, TRACKS } from '../utils/music';

// 14 playable characters — the real squad
const CHARACTERS = [
  {
    id: 'rehan',
    name: 'Rehan',
    alias: 'Code Commander',
    avatar: '👨‍💻',
    image: '/characters/rehan.webp',
    video: '/characters/rehan.mp4',
    basePower: 74,
    characterClass: 'Balanced Tech Warrior',
    description: 'Hoodie on, headset up, keyboard glowing. He codes and conquers.'
  },
  {
    id: 'thiwanka',
    name: 'Thiwanka',
    alias: 'Business Gamer',
    avatar: '🎮',
    image: '/characters/thiwanka.webp',
    video: '/characters/thiwanka.mp4',
    basePower: 72,
    characterClass: 'Strategic Attacker',
    description: 'Casual blazer, controller in hand. Strategy is his weapon.'
  },
  {
    id: 'dhammika',
    name: 'Dhammika',
    alias: 'DJ Voltage',
    avatar: '🎧',
    image: '/characters/dhammika.webp',
    video: '/characters/dhammika.mp4',
    basePower: 70,
    characterClass: 'Rhythm Striker',
    description: 'Neon lights, headphones on. The beat drops — and so do enemies.'
  },
  {
    id: 'sithum',
    name: 'Sithum',
    alias: 'Captain Simpstrike',
    avatar: '🪖',
    image: '/characters/sithum.webp',
    video: '/characters/sithum.mp4',
    basePower: 75,
    characterClass: 'Tactical Defender',
    description: 'Stylized military jacket, soft expression. Tough outside, heart of gold.'
  },
  {
    id: 'supun',
    name: 'Supun',
    alias: 'The Geek Master',
    avatar: '🤓',
    image: '/characters/supun.webp',
    video: '/characters/supun.mp4',
    basePower: 71,
    characterClass: 'Knowledge Boost',
    description: 'Glasses on, code symbols orbiting. Raw intellect is his power.'
  },
  {
    id: 'oshan',
    name: 'Oshan',
    alias: 'Friendly Dev',
    avatar: '💻',
    image: '/characters/oshan.webp',
    video: '/characters/oshan.mp4',
    basePower: 71,
    characterClass: 'Support Hacker',
    description: 'Always smiling, laptop aglow. He buffs teammates and breaks firewalls.'
  },
  {
    id: 'dinuka',
    name: 'Dinuka',
    alias: 'Cricket Crusher',
    avatar: '🏏',
    image: '/characters/dinuka.webp',
    video: '/characters/dinuka.mp4',
    basePower: 78,
    characterClass: 'Power Attacker',
    description: 'Stadium lights, bat raised. Six! Into the crowd — and your health bar.'
  },
  {
    id: 'thimira',
    name: 'Thimira',
    alias: 'Hackerman X',
    avatar: '🕶️',
    image: '/characters/thimira.webp',
    video: '/characters/thimira.mp4',
    basePower: 77,
    characterClass: 'Critical Damage',
    description: 'Dark hoodie, neon matrix swirling. He finds every vulnerability.'
  },
  {
    id: 'frank',
    name: 'Frank',
    alias: 'Iron Titan',
    avatar: '💪',
    image: '/characters/frank.webp',
    video: '/characters/frank.mp4',
    basePower: 80,
    characterClass: 'Heavy Tank',
    description: 'Cartoon-style mountain of muscle. Built different. Hits different.'
  },
  {
    id: 'oshadi',
    name: 'Oshadi',
    alias: 'Pixel Princess',
    avatar: '🌸',
    image: '/characters/oshadi.webp',
    video: '/characters/oshadi.mp4',
    basePower: 70,
    characterClass: 'Charm Booster',
    description: 'Soft pastel glow, anime energy. Underestimate her at your peril.'
  },
  {
    id: 'bathiya',
    name: 'Bathiya',
    alias: 'Chill Boss',
    avatar: '😎',
    image: '/characters/bathiya.webp',
    video: '/characters/bathiya.mp4',
    basePower: 72,
    characterClass: 'Calm Damage',
    description: 'Relaxed stance, sunset behind him. Cool head, calculated strikes.'
  },
  {
    id: 'madara',
    name: 'Madara',
    alias: 'Style King',
    avatar: '👔',
    image: '/characters/madara.webp',
    video: '/characters/madara.mp4',
    basePower: 73,
    characterClass: 'Fashion Strike',
    description: 'Modern streetwear, hero pose. Dripped out and deadly.'
  },
  {
    id: 'avishka',
    name: 'Avishka',
    alias: 'Midnight Maverick',
    avatar: '🔥',
    image: '/characters/avishka.webp',
    video: '/characters/avishka.mp4',
    basePower: 79,
    characterClass: 'High-Risk Attacker',
    description: 'Mature. Confident. Charismatic. "Midnight Strike" hits like a freight train.'
  },
  {
    id: 'thejan',
    name: 'Thejan',
    alias: 'Cyber Champion',
    avatar: '⚡',
    image: '/characters/thejan.webp',
    video: '/characters/thejan.mp4',
    basePower: 76,
    characterClass: 'Cyber Duelist',
    description: 'Wired in, locked on. In the digital arena, Thejan never loses a round.'
  }
];

// ── CharacterCard ──────────────────────────────────────────────
// Shows character image (or emoji fallback). On hover, plays the
// intro video muted over the thumbnail, then stops on mouse-leave.
function CharacterCard({ char, isSelected, onSelect }) {
  const videoRef = useRef(null);

  function handleMouseEnter() {
    if (videoRef.current && char.video) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }

  function handleMouseLeave() {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  return (
    <div
      id={`character-${char.id}`}
      className={`character-card${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(char)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(char)}
      aria-pressed={isSelected}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isSelected && <span className="selected-badge">✔ Selected</span>}

      {/* ── Full-card media layer ──────────────────────── */}
      <div className="character-media">
        {char.video && (
          <video
            ref={videoRef}
            src={char.video}
            className="character-video"
            muted
            playsInline
            loop
            preload="none"
          />
        )}
        {char.image
          ? <img src={char.image} alt={char.name} className="character-image" />
          : <span className="character-avatar">{char.avatar}</span>
        }
      </div>

      {/* ── Text info pinned to bottom (above gradient) ── */}
      <div className="character-info">
        <div className="character-name">{char.name}</div>
        <div className="character-alias">{char.alias}</div>
        <div className="character-class">{char.characterClass}</div>
        <div className="character-power">
          ⚡ {char.basePower}
          <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>&nbsp;/ 100</span>
        </div>
        <div className="character-power-bar">
          <div
            className="character-power-bar-fill"
            style={{ width: `${char.basePower}%` }}
          />
        </div>
        <div className="character-description">{char.description}</div>
      </div>
    </div>
  );
}

function CharacterSelectPage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  // Shuffle characters once per page visit (Fisher-Yates)
  const shuffledCharacters = useMemo(() => {
    const arr = [...CHARACTERS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // 🎵 Play character select music
  useEffect(() => {
    playMusic(TRACKS.CHARACTER);
    return () => stopMusic();
  }, []);

  // [EVENT HANDLER] — Character card click stores selection in state
  function handleSelect(character) {
    soundSelect(); // 🔊 selection pop
    setSelected(character);
  }

  function handleConfirm() {
    if (!selected) return;
    soundClick(); // 🔊 confirm click
    // Pass selected character via router state to game page
    navigate('/game', { state: { character: selected } });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>⚔️ Choose Your Fighter</h1>
        <p>Select a character to enter the Banana Showdown arena</p>
      </div>

      <div className="character-grid">
        {shuffledCharacters.map(char => (
          <CharacterCard
            key={char.id}
            char={char}
            isSelected={selected?.id === char.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <button
            id="confirm-character"
            className="btn btn-primary"
            onClick={handleConfirm}
            style={{ fontSize: '1.05rem', padding: '14px 40px' }}
          >
            {selected.avatar} Battle with {selected.name} →
          </button>
        </div>
      )}
    </div>
  );
}

export default CharacterSelectPage;
