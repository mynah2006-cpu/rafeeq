// ============================================================
// RAFEEQ — PrivacyIndicator Component
//
// IMPORTANT: This component MUST be visible whenever the
// microphone is actively recording. Healthcare regulations
// (and basic user trust) require that patients always know
// when they are being recorded.
//
// Rendered as a fixed badge in the top-right corner of the
// screen, always on top of other content (z-index: emergency).
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import styles from './PrivacyIndicator.module.css';

interface PrivacyIndicatorProps {
  isActive: boolean;
}

export function PrivacyIndicator({ isActive }: PrivacyIndicatorProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          role="status"
          aria-label="Microphone is active — recording in progress"
        >
          {/* Pulsing dot */}
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.label}>LIVE</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
