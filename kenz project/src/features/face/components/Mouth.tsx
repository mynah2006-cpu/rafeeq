// ============================================================
// RAFEEQ — Mouth Component (Neon Minimal Design)
//
// The mouth renders as one of:
//   1. Stroke bezier curve  — for all states (smile, frown, flat)
//   2. Filled oval ellipse  — for 'surprised' open-mouth state
//
// Both layers always exist in the DOM; only opacity changes.
// This lets Framer Motion cross-fade between them cleanly.
//
// During 'speaking', the curve is driven by mouthOpenness (0–1).
// ============================================================

import { motion } from 'framer-motion';
import { useFaceStore } from '../../../store/faceStore';
import { getExpression } from '../animations/expressionAnimations';
import { FACE_SPRING } from './springConfig';

const NEON = 'var(--color-neon)';

// Mouth center coordinates in the SVG viewBox (0 0 240 200)
const MOUTH_CX = 120;
const MOUTH_CY = 152;

/**
 * Builds the speaking mouth path.
 * Anchors are fixed; only the control point Y changes.
 * openness 0 = nearly closed, 1 = fully open.
 */
function buildSpeakingPath(openness: number): string {
  const controlY = 152 + openness * 30;
  return `M 85 150 Q ${MOUTH_CX} ${controlY} 155 150`;
}

export function Mouth() {
  const faceState     = useFaceStore((s) => s.faceState);
  const mouthOpenness = useFaceStore((s) => s.mouthOpenness);
  const { mouth }     = getExpression(faceState);

  const isSpeaking = faceState === 'speaking';
  const isOval     = mouth.type === 'oval' && !isSpeaking;

  // Determine the active path
  const activePath = isSpeaking
    ? buildSpeakingPath(mouthOpenness)
    : mouth.path;

  return (
    <g aria-hidden="true">
      {/* --- Stroke curve — used for all non-oval states --- */}
      <motion.path
        d={activePath}
        stroke={NEON}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
        animate={{
          d: activePath,
          opacity: isOval ? 0 : 1,
        }}
        transition={FACE_SPRING}
      />

      {/* --- Filled oval — used only for 'surprised' open mouth --- */}
      <motion.ellipse
        cx={MOUTH_CX}
        cy={MOUTH_CY}
        rx={14}
        ry={17}
        fill={NEON}
        stroke="none"
        animate={{
          opacity: isOval ? 1 : 0,
          ry: isOval ? 17 : 2,
        }}
        transition={FACE_SPRING}
        aria-hidden="true"
      />
    </g>
  );
}
