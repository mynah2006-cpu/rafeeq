// ============================================================
// RAFEEQ — EmergencyOverlay Component
//
// Full-screen overlay that appears when an emergency keyword
// is detected. Stays visible until explicitly dismissed.
//
// Design rationale:
// - Uses RED (not neon cyan) — unmistakably different from
//   the normal UI, signals urgency to any nearby staff.
// - Contains large, high-contrast text readable from a distance.
// - A "False Alarm" button allows quick dismissal.
// - TTS announcement plays automatically on mount (handled by orchestrator).
// ============================================================

import { motion } from 'framer-motion';
import { useVoiceStore } from '../../store/voiceStore';
import styles from './EmergencyOverlay.module.css';

export function EmergencyOverlay() {
  const isEmergency     = useVoiceStore((s) => s.isEmergency);
  const dismissEmergency = useVoiceStore((s) => s.dismissEmergency);

  if (!isEmergency) return null;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="alertdialog"
      aria-modal="true"
      aria-label="Emergency alert — help is on the way"
      aria-live="assertive"
    >
      <motion.div
        className={styles.card}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.05 }}
      >
        {/* Alert icon — subtle breathing, not strobe */}
        <div className={styles.alertIcon} aria-hidden="true">
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="44"
            height="44"
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" x2="12" y1="9" y2="13" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </motion.svg>
        </div>

        <h2 className={styles.title}>I've got you</h2>

        <p className={styles.subtitle}>
          The team is on their way right now.<br />
          Just breathe — I'm right here with you.
        </p>

        <div className={styles.divider} aria-hidden="true" />

        <p className={styles.instruction}>
          A nurse or doctor will be with you very shortly.<br />
          If everything's fine, just let me know below.
        </p>

        <button
          type="button"
          id="emergency-dismiss-btn"
          className={styles.dismissBtn}
          onClick={dismissEmergency}
          aria-label="Dismiss emergency alert — false alarm"
        >
          I'm okay — false alarm
        </button>
      </motion.div>
    </motion.div>
  );
}
