// ============================================================
//  CharacterSelectPage — Pick your fighter
//  Each character has a name, emoji avatar, base power, and class
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundSelect, soundClick } from '../utils/sounds';

// Six playable characters with unique stats
const CHARACTERS = [
  {
    id: 'warrior',
    name: 'Iron Fist',
    avatar: '🥷',
    basePower: 75,
    characterClass: 'Warrior',
    description: 'Brute strength. No mercy.'
  },
  {
    id: 'mage',
    name: 'Zara Spark',
    avatar: '🧙‍♀️',
    basePower: 65,
    characterClass: 'Mage',
    description: 'Ancient magic, volatile power.'
  },
  {
    id: 'archer',
    name: 'Swift Arrow',
    avatar: '🏹',
    basePower: 60,
    characterClass: 'Ranger',
    description: 'Never misses. Ever.'
  },
  {
    id: 'robot',
    name: 'C0R3-X',
    avatar: '🤖',
    basePower: 80,
    characterClass: 'Cyborg',
    description: 'Engineered for destruction.'
  },
  {
    id: 'dragon',
    name: 'Emberwing',
    avatar: '🐉',
    basePower: 90,
    characterClass: 'Dragon',
    description: 'Ancient. Unstoppable. Fiery.'
  },
  {
    id: 'ninja',
    name: 'Shadow Step',
    avatar: '🕵️',
    basePower: 70,
    characterClass: 'Ninja',
    description: 'Strikes before you blink.'
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
