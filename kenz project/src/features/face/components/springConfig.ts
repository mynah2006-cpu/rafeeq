// ============================================================
// RAFEEQ — Spring Physics Configuration
//
// Centralized spring configs. Framer Motion spring animations
// are defined by stiffness, damping, and mass.
// Tune these values to change the overall "feel" of the face.
// ============================================================

import type { Transition } from 'framer-motion';

/** General face expression transitions — snappy but organic */
export const FACE_SPRING: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 18,
  mass: 0.8,
};

/** Slower, floatier transitions for breathing and idle */
export const BREATH_SPRING: Transition = {
  type: 'spring',
  stiffness: 40,
  damping: 12,
  mass: 1.2,
};

/** Blink — very fast, nearly instant */
export const BLINK_SPRING: Transition = {
  type: 'spring',
  stiffness: 800,
  damping: 30,
  mass: 0.4,
};

/** Pupil tracking — smooth, slightly delayed */
export const PUPIL_SPRING: Transition = {
  type: 'spring',
  stiffness: 90,
  damping: 20,
  mass: 0.6,
};
