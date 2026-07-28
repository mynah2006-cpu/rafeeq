// ============================================================
// RAFEEQ — useExpressionCycle Hook
//
// Automatically cycles through all 8 face states when the
// companion is idle (no voice conversation in progress).
// Gives the face a sense of life and personality without
// any user interaction needed.
//
// Usage:
//   useExpressionCycle({ isActive: !isListening && !isSpeaking })
// ============================================================

import { useEffect, useRef } from 'react';
import { useFaceStore } from '../../../store/faceStore';
import type { FaceState } from '../../../types';

/**
 * The idle showcase sequence — cycles through all 8 expressions.
 * Order chosen for narrative feel: calm → curious → thoughtful →
 * expressive → joyful → empathetic → surprised → restful → repeat.
 */
const CYCLE_SEQUENCE: FaceState[] = [
  'idle',
  'listening',
  'thinking',
  'speaking',
  'happy',
  'concerned',
  'surprised',
  'sleeping',
];

/** How long (ms) each expression is held before transitioning to the next. */
const EXPRESSION_DURATION_MS = 3500;

/** How long (ms) to wait after going idle before the auto-cycle begins.
 *  Prevents the cycle from fighting with manual actions. */
const INITIAL_IDLE_DELAY_MS = 2000;

interface UseExpressionCycleOptions {
  /** When true the cycle runs; when false it stops and resets to 'idle'. */
  isActive: boolean;
}

export function useExpressionCycle({ isActive }: UseExpressionCycleOptions): void {
  const setFaceState = useFaceStore((s) => s.setFaceState);

  const indexRef         = useRef(0);
  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialDelayRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (intervalRef.current)     { clearInterval(intervalRef.current);  intervalRef.current = null; }
    if (initialDelayRef.current) { clearTimeout(initialDelayRef.current); initialDelayRef.current = null; }
  };

  useEffect(() => {
    if (!isActive) {
      // Voice pipeline took control — stop the cycle, reset to idle.
      clearTimers();
      indexRef.current = 0;
      return;
    }

    // Wait a moment before starting so we don't fight transitions
    // triggered by the voice pipeline ending.
    initialDelayRef.current = setTimeout(() => {
      // Start from current index, advance on each tick
      const tick = () => {
        indexRef.current = (indexRef.current + 1) % CYCLE_SEQUENCE.length;
        setFaceState(CYCLE_SEQUENCE[indexRef.current]);
      };

      // Set the first state immediately (after delay)
      setFaceState(CYCLE_SEQUENCE[indexRef.current]);

      intervalRef.current = setInterval(tick, EXPRESSION_DURATION_MS);
    }, INITIAL_IDLE_DELAY_MS);

    return clearTimers;
  // setFaceState is stable — safe to exclude from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
}
