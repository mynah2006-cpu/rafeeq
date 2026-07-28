// ============================================================
// RAFEEQ — Face Animation Store (Zustand)
//
// This is the single source of truth for all face animation state.
// Any component that wants to change how the face looks writes to
// this store. The face components read from it.
//
// Why Zustand? Zero boilerplate, no Provider wrapping, perfect
// for cross-cutting state like animation modes.
// ============================================================

import { create } from 'zustand';
import type { FaceState, PupilTarget } from '../types';

interface FaceStore {
  // --- Current animation state ---
  faceState: FaceState;
  setFaceState: (state: FaceState) => void;

  // --- Blink control ---
  isBlinking: boolean;
  setIsBlinking: (value: boolean) => void;

  // --- Mouth openness for speech sync (0 = closed, 1 = fully open) ---
  mouthOpenness: number;
  setMouthOpenness: (value: number) => void;

  // --- Pupil position (normalized -1 to 1) ---
  pupilTarget: PupilTarget;
  setPupilTarget: (target: PupilTarget) => void;

  // --- Breathing scale (1 = normal, 1.02 = inhaled) ---
  breathScale: number;
  setBreathScale: (value: number) => void;

  // --- Thinking dot angle (0–360 degrees) ---
  thinkingAngle: number;
  setThinkingAngle: (value: number) => void;

  // --- Is the microphone actively recording? ---
  isMicActive: boolean;
  setIsMicActive: (value: boolean) => void;
}

export const useFaceStore = create<FaceStore>((set) => ({
  faceState: 'idle',
  setFaceState: (state) => set({ faceState: state }),

  isBlinking: false,
  setIsBlinking: (value) => set({ isBlinking: value }),

  mouthOpenness: 0,
  setMouthOpenness: (value) => set({ mouthOpenness: Math.max(0, Math.min(1, value)) }),

  pupilTarget: { x: 0, y: 0 },
  setPupilTarget: (target) => set({ pupilTarget: target }),

  breathScale: 1,
  setBreathScale: (value) => set({ breathScale: value }),

  thinkingAngle: 0,
  setThinkingAngle: (value) => set({ thinkingAngle: value % 360 }),

  isMicActive: false,
  setIsMicActive: (value) => set({ isMicActive: value }),
}));
