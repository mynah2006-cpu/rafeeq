// ============================================================
// RAFEEQ — Animation Hooks
//
// useBlink:        Randomized blink loop (eyes snap shut → open)
// useBreath:       Sine-wave scale oscillation for organic life
// useSpeakingMouth: Irregular mouth movement in 'speaking' state
// ============================================================

import { useEffect, useRef } from 'react';
import { useFaceStore } from '../../../store/faceStore';

// --- Blink timing ---
const BLINK_DURATION_MS  = 120;
const BLINK_MIN_INTERVAL = 2500;
const BLINK_MAX_INTERVAL = 6000;

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Schedules automatic eye blinking. Paused during sleeping/thinking. */
export function useBlink(): void {
  const setIsBlinking = useFaceStore((s) => s.setIsBlinking);
  const faceState     = useFaceStore((s) => s.faceState);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't blink when eyes are already modified by state
    if (faceState === 'sleeping' || faceState === 'thinking') {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    function schedule() {
      timerRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          schedule();
        }, BLINK_DURATION_MS);
      }, rand(BLINK_MIN_INTERVAL, BLINK_MAX_INTERVAL));
    }

    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [faceState, setIsBlinking]);
}

// --- Breathing ---
const BREATH_PERIOD_MS = 4400;
const BREATH_SCALE_MIN = 1.000;
const BREATH_SCALE_MAX = 1.016;

/** Drives a subtle sine-wave scale on the face SVG. */
export function useBreath(): void {
  const setBreathScale = useFaceStore((s) => s.setBreathScale);
  const faceState      = useFaceStore((s) => s.faceState);
  const rafRef         = useRef<number | null>(null);
  const startRef       = useRef<number | null>(null);

  useEffect(() => {
    const amplitude = (BREATH_SCALE_MAX - BREATH_SCALE_MIN) / 2;
    const baseline  = BREATH_SCALE_MIN + amplitude;
    const period    = faceState === 'sleeping' ? BREATH_PERIOD_MS * 1.9 : BREATH_PERIOD_MS;

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const phase = ((ts - startRef.current) % period) / period;
      setBreathScale(baseline + amplitude * Math.sin(phase * 2 * Math.PI));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [faceState, setBreathScale]);
}

// --- Speaking mouth oscillation ---
// Uses layered sine waves to produce irregular, speech-like movement.

/** Animates mouthOpenness while in 'speaking' state; resets to 0 otherwise. */
export function useSpeakingMouth(): void {
  const faceState        = useFaceStore((s) => s.faceState);
  const setMouthOpenness = useFaceStore((s) => s.setMouthOpenness);
  const rafRef           = useRef<number | null>(null);
  const startRef         = useRef<number | null>(null);

  useEffect(() => {
    if (faceState !== 'speaking') {
      setMouthOpenness(0);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;
      // Layered sines at different frequencies → irregular speech rhythm
      const raw =
        0.38 * Math.abs(Math.sin(t * 2.9)) +
        0.30 * Math.abs(Math.sin(t * 4.3 + 1.1)) +
        0.18 * Math.abs(Math.sin(t * 7.7 + 2.3));
      setMouthOpenness(Math.min(1, raw));
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [faceState, setMouthOpenness]);
}
