import { motion, AnimatePresence } from 'framer-motion';
import styles from './MicButton.module.css';

interface MicButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  isUnsupported: boolean;
  onToggle: () => void;
}

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" width="24" height="24" aria-hidden="true">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const StopIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const LoadingDots = () => (
  <motion.div className={styles.dots}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <span /><span /><span />
  </motion.div>
);

export function MicButton({ isListening, isSpeaking, isUnsupported, onToggle }: MicButtonProps) {
  return (
    <div className={styles.wrapper}>
      <motion.button
        type="button"
        id="mic-button"
        className={`${styles.btn} ${isListening ? styles.listening : ''} ${isSpeaking ? styles.speaking : ''}`}
        onClick={onToggle}
        disabled={isUnsupported}
        aria-label={isUnsupported ? 'Voice not supported' : isListening ? 'Stop listening' : isSpeaking ? 'Interrupt' : 'Start conversation'}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.span key="listening"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className={styles.activeIcon}
            >
              <LoadingDots />
            </motion.span>
          ) : isSpeaking ? (
            <motion.span key="stop"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}>
              <StopIcon />
            </motion.span>
          ) : (
            <motion.span key="mic"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}>
              <MicIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
