import { motion } from 'framer-motion';
import { useFaceStore } from '../../../store/faceStore';
import { getExpression } from '../animations/expressionAnimations';
import { FACE_SPRING } from './springConfig';

const NEON = 'var(--color-neon)';

interface BrowProps {
  side: 'left' | 'right';
  cx: number;
  cy: number;
}

/**
 * Mirror a simple "M x1 y1 Q cx cy x2 y2" path across SVG width (240).
 * Only handles the specific path format used in expressionAnimations.
 */
function mirrorPathX(path: string): string {
  // Parse: "M x1 y1 Q cx cy x2 y2"
  const nums = path.match(/[\d.]+/g);
  if (!nums || nums.length !== 6) return path;

  const [x1, y1, qx, qy, x2, y2] = nums.map(Number);
  return `M ${240 - x2} ${y2} Q ${240 - qx} ${qy} ${240 - x1} ${y1}`;
}

function BrowShape({ side, cx, cy }: BrowProps) {
  const faceState = useFaceStore((s) => s.faceState);
  const { eyebrow } = getExpression(faceState);

  const basePath = eyebrow.path;
  const displayPath = side === 'right' ? mirrorPathX(basePath) : basePath;

  return (
    <motion.path
      d={displayPath}
      stroke={NEON}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
      animate={{
        d: displayPath,
        rotate: side === 'right' ? -eyebrow.rotate : eyebrow.rotate,
        translateY: eyebrow.offsetY,
        opacity: eyebrow.opacity,
      }}
      style={{
        originX: `${cx}px`,
        originY: `${cy}px`,
      }}
      transition={FACE_SPRING}
      aria-hidden="true"
    />
  );
}

export function Eyebrows() {
  return (
    <g aria-hidden="true">
      <BrowShape side="left"  cx={75}  cy={43} />
      <BrowShape side="right" cx={165} cy={43} />
    </g>
  );
}
