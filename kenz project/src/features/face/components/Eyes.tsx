// ============================================================
// RAFEEQ — Eyes Component (Clean, Cinematic)
// Pure filled circles + eyelids only. No pupil.
// ============================================================

import { motion } from 'framer-motion';
import { useFaceStore } from '../../../store/faceStore';
import { getExpression } from '../animations/expressionAnimations';
import { BLINK_SPRING, FACE_SPRING } from './springConfig';

const NEON = 'var(--color-neon)';

interface EyeProps {
  cx: number;
  cy: number;
}

function EyelidOverlay({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const faceState  = useFaceStore((s) => s.faceState);
  const isBlinking = useFaceStore((s) => s.isBlinking);
  const { eyelid } = getExpression(faceState);

  const closeAmount = isBlinking ? 1 : eyelid.closeAmount;

  return (
    <motion.ellipse
      cx={cx}
      cy={cy - r * (1 - closeAmount * 0.85)}
      rx={r + 2}
      ry={r * closeAmount * 0.9 + 1}
      fill="#000000"
      animate={{
        ry: r * closeAmount * 0.9 + 1,
        cy: cy - r * (1 - closeAmount * 0.85),
        opacity: isBlinking || eyelid.opacity > 0 ? 1 : 0,
      }}
      transition={isBlinking ? BLINK_SPRING : FACE_SPRING}
      aria-hidden="true"
    />
  );
}

function EyeShape({ cx, cy }: EyeProps) {
  const isBlinking = useFaceStore((s) => s.isBlinking);
  const faceState  = useFaceStore((s) => s.faceState);
  const { eye }    = getExpression(faceState);
  const { r, fillOpacity, strokeWidth, scaleX, scaleY, offsetY } = eye;

  const activeScaleY = isBlinking ? 0.04 : scaleY;

  return (
    <g aria-hidden="true">
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill={NEON}
        stroke={NEON}
        animate={{
          r,
          fillOpacity,
          strokeWidth,
          scaleX,
          scaleY: activeScaleY,
          translateY: offsetY,
        }}
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
        transition={isBlinking ? BLINK_SPRING : FACE_SPRING}
      />
      <EyelidOverlay cx={cx} cy={cy} r={r} />
    </g>
  );
}

export function Eyes() {
  return (
    <g aria-hidden="true">
      <EyeShape cx={75}  cy={82} />
      <EyeShape cx={165} cy={82} />
    </g>
  );
}