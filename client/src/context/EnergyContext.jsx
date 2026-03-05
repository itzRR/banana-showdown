// ============================================================
//  EnergyContext — Global ⚡ energy state for Banana Showdown
//  • Loads from server ONLY after user is confirmed authenticated
//  • localStorage used as instant cache / offline fallback
//  • Debounced save to server on every change
//  • Call loadEnergyFromServer() after login to sync from DB
// ============================================================

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import api from '../utils/api';

const MAX_ENERGY  = 150;
const INIT_ENERGY = 100;
const LS_KEY      = 'bs_energy';
const DEBOUNCE_MS = 1200;

const EnergyContext = createContext(null);

export function EnergyProvider({ children }) {
  const [energy, setEnergy] = useState(() => {
    // Start from localStorage instantly (avoids flash)
    const stored = localStorage.getItem(LS_KEY);
    const parsed = Number(stored);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= MAX_ENERGY) return parsed;
    return INIT_ENERGY;
  });

  const saveTimer = useRef(null);

  // ── Debounced server save ───────────────────────────────────
  function scheduleSave(val) {
    localStorage.setItem(LS_KEY, String(val));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.post('/api/puzzle/energy', { energy: val }).catch(() => {});
    }, DEBOUNCE_MS);
  }

  /**
   * Call this AFTER the user is confirmed logged in to sync
   * the real energy value from the server DB.
   */
  const loadEnergyFromServer = useCallback(() => {
    api.get('/api/puzzle/energy')
      .then(res => {
        const serverEnergy = res.data.energy;
        setEnergy(serverEnergy);
        localStorage.setItem(LS_KEY, String(serverEnergy));
      })
      .catch(() => {
        // Server unreachable — keep localStorage value
      });
  }, []);

  /** Add energy — capped at MAX_ENERGY */
  const addEnergy = useCallback((amount) => {
    setEnergy(prev => {
      const next = Math.min(prev + amount, MAX_ENERGY);
      scheduleSave(next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Spend energy — floored at 0. Returns true if successful. */
  const spendEnergy = useCallback((amount) => {
    let success = false;
    setEnergy(prev => {
      if (prev >= amount) {
        const next = prev - amount;
        scheduleSave(next);
        success = true;
        return next;
      }
      return prev;
    });
    return success;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Check if user can afford a cost */
  const canAfford = useCallback((amount) => energy >= amount, [energy]);

  return (
    <EnergyContext.Provider value={{
      energy, maxEnergy: MAX_ENERGY,
      addEnergy, spendEnergy, canAfford,
      loadEnergyFromServer
    }}>
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const ctx = useContext(EnergyContext);
  if (!ctx) throw new Error('useEnergy must be used inside <EnergyProvider>');
  return ctx;
}
