// ============================================================
// RAFEEQ — StatusBar (Dev Control Panel)
//
// Keyboard shortcuts to preview all 8 face states.
// Each button shows a tiny SVG mini-face icon — no emojis.
// ============================================================

import { useEffect } from 'react';
import { useFaceStore } from '../../store/faceStore';
import type { FaceState } from '../../types';
import styles from './StatusBar.module.css';

// --- Tiny SVG mini-face icons ---
const ICONS: Record<FaceState, React.ReactNode> = {
  idle: (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="11" r="5" fill="currentColor" />
      <circle cx="28" cy="11" r="5" fill="currentColor" />
      <path d="M 10 23 Q 20 29 30 23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  listening: (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="11" r="6.5" fill="currentColor" />
      <circle cx="28" cy="11" r="6.5" fill="currentColor" />
      <path d="M 11 23 Q 20 27 29 23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  thinking: (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="12" cy="11" rx="6" ry="2.5" fill="currentColor" />
      <ellipse cx="28" cy="11" rx="6" ry="2.5" fill="currentColor" />
      <path d="M 13 24 L 27 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  speaking: (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="11" r="5" fill="currentColor" />
      <circle cx="28" cy="11" r="5" fill="currentColor" />
      <path d="M 9 22 Q 20 31 31 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  happy: (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="11" r="7" fill="currentColor" />
      <circle cx="28" cy="11" r="7" fill="currentColor" />
      <path d="M 7 21 Q 20 32 33 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  concerned: (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="11" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="28" cy="11" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M 11 27 Q 20 21 29 27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  surprised: (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="11" r="5.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="28" cy="11" r="5.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <ellipse cx="20" cy="25" rx="5" ry="6" fill="currentColor" />
    </svg>
  ),
  sleeping: (
    <svg viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="5" y="9.5" width="14" height="3" rx="1.5" fill="currentColor" />
      <rect x="21" y="9.5" width="14" height="3" rx="1.5" fill="currentColor" />
      <path d="M 14 24 Q 20 28 26 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
};

const STATES: { key: string; state: FaceState; label: string }[] = [
  { key: '1', state: 'idle',      label: 'Idle'     },
  { key: '2', state: 'listening', label: 'Listen'   },
  { key: '3', state: 'thinking',  label: 'Think'    },
  { key: '4', state: 'speaking',  label: 'Speak'    },
  { key: '5', state: 'happy',     label: 'Happy'    },
  { key: '6', state: 'concerned', label: 'Concern'  },
  { key: '7', state: 'surprised', label: 'Surprise' },
  { key: '8', state: 'sleeping',  label: 'Sleep'    },
];

export function StatusBar() {
  const isDev = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEV_TOOLS === 'true';

  // Hooks must ALWAYS be called — React Rules of Hooks
  const faceState        = useFaceStore((s) => s.faceState);
  const setFaceState     = useFaceStore((s) => s.setFaceState);
  const setMouthOpenness = useFaceStore((s) => s.setMouthOpenness);

  useEffect(() => {
    if (!isDev) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const match = STATES.find((s) => s.key === e.key);
      if (match) {
        setFaceState(match.state);
        setMouthOpenness(0);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isDev, setFaceState, setMouthOpenness]);

  // Conditional render AFTER hooks
  if (!isDev) return null;

  return (
    <nav className={styles.bar} aria-label="Face state controls (development)">
      <div className={styles.buttons} role="group" aria-label="Emotion states">
        {STATES.map(({ key, state, label }) => {
          const isActive = faceState === state;
          return (
            <button
              key={state}
              type="button"
              id={`state-btn-${state}`}
              className={`${styles.btn} ${isActive ? styles.active : ''}`}
              onClick={() => {
                setFaceState(state);
                setMouthOpenness(0);
              }}
              aria-pressed={isActive}
              title={`${label} — press key ${key}`}
            >
              <span className={styles.icon}>{ICONS[state]}</span>
              <span className={styles.label}>{label}</span>
              <kbd className={styles.kbd}>{key}</kbd>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
