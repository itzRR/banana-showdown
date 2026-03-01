// ============================================================
//  CharacterSelectPage — Pick your fighter
//  Each character has a name, emoji avatar, base power, and class
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundSelect, soundClick } from '../utils/sounds';

// 13 playable characters — the real squad
const CHARACTERS = [
  {
    id: 'rehan',
    name: 'Rehan',
    alias: 'Code Commander',
    avatar: '👨‍💻',
    basePower: 78,
    characterClass: 'Balanced Tech Warrior',
    description: 'Hoodie on, headset up, keyboard glowing. He codes and conquers.'
  },
  {
    id: 'thiwanka',
    name: 'Thiwanka',
    alias: 'Business Gamer',
    avatar: '🎮',
    basePower: 74,
    characterClass: 'Strategic Attacker',
    description: 'Casual blazer, controller in hand. Strategy is his weapon.'
  },
  {
    id: 'dhammika',
    name: 'Dhammika',
    alias: 'DJ Voltage',
    avatar: '🎧',
    basePower: 70,
    characterClass: 'Rhythm Striker',
    description: 'Neon lights, headphones on. The beat drops — and so do enemies.'
  },
  {
    id: 'sithum',
    name: 'Sithum',
    alias: 'Captain Simpstrike',
    avatar: '🪖',
    basePower: 76,
    characterClass: 'Tactical Defender',
    description: 'Stylized military jacket, soft expression. Tough outside, heart of gold.'
  },
  {
    id: 'supun',
    name: 'Supun',
    alias: 'The Geek Master',
    avatar: '🤓',
    basePower: 72,
    characterClass: 'Knowledge Boost',
    description: 'Glasses on, code symbols orbiting. Raw intellect is his power.'
  },
  {
    id: 'oshan',
    name: 'Oshan',
    alias: 'Friendly Dev',
    avatar: '💻',
    basePower: 68,
    characterClass: 'Support Hacker',
    description: 'Always smiling, laptop aglow. He buffs teammates and breaks firewalls.'
  },
  {
    id: 'dinuka',
    name: 'Dinuka',
    alias: 'Cricket Crusher',
    avatar: '🏏',
    basePower: 85,
    characterClass: 'Power Attacker',
    description: 'Stadium lights, bat raised. Six! Into the crowd — and your health bar.'
  },
  {
    id: 'thimira',
    name: 'Thimira',
    alias: 'Hackerman X',
    avatar: '🕶️',
    basePower: 88,
    characterClass: 'Critical Damage',
    description: 'Dark hoodie, neon matrix swirling. He finds every vulnerability.'
  },
  {
    id: 'frank',
    name: 'Frank',
    alias: 'Iron Titan',
    avatar: '💪',
    basePower: 92,
    characterClass: 'Heavy Tank',
    description: 'Cartoon-style mountain of muscle. Built different. Hits different.'
  },
  {
    id: 'oshadi',
    name: 'Oshadi',
    alias: 'Pixel Princess',
    avatar: '🌸',
    basePower: 66,
    characterClass: 'Charm Booster',
    description: 'Soft pastel glow, anime energy. Underestimate her at your peril.'
  },
  {
    id: 'bathiya',
    name: 'Bathiya',
    alias: 'Chill Boss',
    avatar: '😎',
    basePower: 73,
    characterClass: 'Calm Damage',
    description: 'Relaxed stance, sunset behind him. Cool head, calculated strikes.'
  },
  {
    id: 'madara',
    name: 'Madara',
    alias: 'Style King',
    avatar: '👔',
    basePower: 77,
    characterClass: 'Fashion Strike',
    description: 'Modern streetwear, hero pose. Dripped out and deadly.'
  },
  {
    id: 'avishka',
    name: 'Avishka',
    alias: 'Midnight Maverick',
    avatar: '🔥',
    basePower: 90,
    characterClass: 'High-Risk Attacker',
    description: 'Mature. Confident. Charismatic. "Midnight Strike" hits like a freight train.'
  }
];

function CharacterSelectPage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

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
        {CHARACTERS.map(char => (
          <div
            key={char.id}
            id={`character-${char.id}`}
            className={`character-card${selected?.id === char.id ? ' selected' : ''}`}
            onClick={() => handleSelect(char)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleSelect(char)}
            aria-pressed={selected?.id === char.id}
          >
            {selected?.id === char.id && (
              <span className="selected-badge">Selected</span>
            )}
            <span className="character-avatar">{char.avatar}</span>
            <div className="character-name">{char.name}</div>
            <div className="character-class">{char.characterClass}</div>
            <div className="character-power">⚡ {char.basePower} base power</div>
          </div>
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
