// ============================================================
// RAFEEQ — RafeeqFace (Neon Minimal Design)
//
// Pure SVG on pure black. Two shapes + one curve.
// All expression comes from shape morphing, not decoration.
// ============================================================

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useFaceStore } from '../../../store/faceStore';
import { useBlink, useBreath, useSpeakingMouth } from '../animations/useFaceAnimations';
import { useEyeTracking } from '../animations/useEyeTracking';
import { Eyes }     from './Eyes';
import { Eyebrows } from './Eyebrows';
import { Mouth }    from './Mouth';
import { BREATH_SPRING } from './springConfig';
import styles from './RafeeqFace.module.css';

export function RafeeqFace() {
  const svgRef      = useRef<SVGSVGElement>(null);
  const breathScale = useFaceStore((s) => s.breathScale);
  const faceState   = useFaceStore((s) => s.faceState);

  // Activate all animation loops
  useBlink();
  useBreath();
  useSpeakingMouth();
  useEyeTracking(svgRef);

  const isListening = faceState === 'listening';
  const isSpeaking  = faceState === 'speaking';

  return (
    <div
      className={styles.wrapper}
      aria-label="Rafeeq animated face"
      role="img"
    >
      {/* Listening pulse rings — concentric neon rings emanating outward */}
      {isListening && (
        <div className={styles.listenRings} aria-hidden="true">
          <span className={styles.ring} style={{ animationDelay: '0ms' }} />
          <span className={styles.ring} style={{ animationDelay: '500ms' }} />
          <span className={styles.ring} style={{ animationDelay: '1000ms' }} />
        </div>
      )}

      {/* Speaking waveform — 5 bars below the face */}
      {isSpeaking && (
        <div className={styles.waveform} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={styles.waveBar}
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      )}

      {/* The face SVG — breathing scale applied at this level */}
      <motion.svg
        ref={svgRef}
        viewBox="0 0 240 200"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.faceSvg}
        animate={{ scale: breathScale }}
        transition={BREATH_SPRING}
        aria-hidden="true"
      >
        <Eyebrows />
        <Eyes />
        <Mouth />
      </motion.svg>
    </div>
  );
}
