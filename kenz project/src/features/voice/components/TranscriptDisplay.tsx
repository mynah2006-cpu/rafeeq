import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceStore } from '../../../store/voiceStore';
import styles from './TranscriptDisplay.module.css';

interface TranscriptDisplayProps {
  interim: string;
  transcript: string;
  isListening: boolean;
  isSpeaking: boolean;
}

function TypewriterText({ text, isSpeaking }: { text: string; isSpeaking: boolean }) {
  const [displayed, setDisplayed] = useState('');
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed('');

    if (!text) return;

    const interval = setInterval(() => {
      idxRef.current++;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) clearInterval(interval);
    }, 25);

    return () => clearInterval(interval);
  }, [text]);

  if (!isSpeaking) return <>{text}</>;

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className={styles.cursor} aria-hidden="true">|</span>
      )}
    </span>
  );
}

function ConversationHistory() {
  const conversation = useVoiceStore((s) => s.conversation);
  const lastResponse = useVoiceStore((s) => s.lastResponse);
  const isSpeakingNow = lastResponse.length > 0;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  const lastAssistantMsg = conversation.filter((m) => m.role === 'assistant').pop();

  return (
    <div className={styles.history} ref={scrollRef}>
      {conversation.map((msg) => {
        const isPatient = msg.role === 'patient';
        const isLastAssistant = msg === lastAssistantMsg;

        return (
          <motion.div
            key={msg.id}
            className={`${styles.bubble} ${isPatient ? styles.patient : styles.assistant}`}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <span className={styles.bubbleLabel}>
              {isPatient ? 'You' : 'Rafeeq'}
            </span>
            <p className={styles.bubbleText}>
              {isLastAssistant && isSpeakingNow ? (
                <TypewriterText text={msg.content} isSpeaking={true} />
              ) : (
                msg.content
              )}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

export function TranscriptDisplay({
  interim,
  isListening,
}: TranscriptDisplayProps) {
  const conversation = useVoiceStore((s) => s.conversation);
  const showConversation = conversation.length > 0;

  // Show interim while listening
  const showInterim = isListening && interim.length > 0;

  return (
    <>
      {showConversation && <ConversationHistory />}

      <AnimatePresence mode="wait">
        {showInterim && (
          <motion.div
            key="interim"
            className={`${styles.bubble} ${styles.patient}`}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 0.7, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{ marginTop: '8px', width: '100%' }}
          >
            <span className={styles.bubbleLabel}>You (listening...)</span>
            <p className={styles.bubbleText}>
              {interim}
              <span className={styles.cursor} aria-hidden="true">|</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
