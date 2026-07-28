// ============================================================
// RAFEEQ — Mouse/Touch Tracking Hook
//
// Converts screen mouse or touch coordinates into normalized
// [-1, 1] pupil targets relative to the face SVG element.
// Falls back to a slow idle drift when there's no pointer.
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useFaceStore } from '../../../store/faceStore';

const IDLE_DRIFT_PERIOD = 6000; // ms for one full idle drift cycle
const IDLE_RETURN_DELAY = 3000; // ms after last pointer move before idle drift resumes

export function useEyeTracking(faceContainerRef: React.RefObject<SVGSVGElement | null>): void {
  const setPupilTarget = useFaceStore((s) => s.setPupilTarget);
  const faceState      = useFaceStore((s) => s.faceState);

  const idleRafRef    = useRef<number | null>(null);
  const startRef      = useRef<number | null>(null);
  const returnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTrackingRef  = useRef(false);

  const startIdleDrift = useCallback(() => {
    isTrackingRef.current = false;

    function drift(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const t = (timestamp - startRef.current) / IDLE_DRIFT_PERIOD;
      // Figure-eight Lissajous pattern for natural eye movement
      const x = Math.sin(t * 2 * Math.PI) * 0.3;
      const y = Math.sin(t * 4 * Math.PI) * 0.15;
      setPupilTarget({ x, y });
      idleRafRef.current = requestAnimationFrame(drift);
    }

    if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
    startRef.current = null;
    idleRafRef.current = requestAnimationFrame(drift);
  }, [setPupilTarget]);

  const stopIdleDrift = useCallback(() => {
    if (idleRafRef.current) {
      cancelAnimationFrame(idleRafRef.current);
      idleRafRef.current = null;
    }
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (faceState === 'sleeping') return;

    const svgEl = faceContainerRef.current;
    if (!svgEl) return;

    const rect = svgEl.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;

    // Normalize relative to face center, clamped to [-1, 1]
    const rawX = (e.clientX - centerX) / (rect.width  / 2);
    const rawY = (e.clientY - centerY) / (rect.height / 2);
    const x = Math.max(-1, Math.min(1, rawX * 0.6));
    const y = Math.max(-1, Math.min(1, rawY * 0.6));

    if (!isTrackingRef.current) {
      isTrackingRef.current = true;
      stopIdleDrift();
    }

    setPupilTarget({ x, y });

    // Schedule return to idle drift after inactivity
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    returnTimerRef.current = setTimeout(startIdleDrift, IDLE_RETURN_DELAY);
  }, [faceState, faceContainerRef, setPupilTarget, stopIdleDrift, startIdleDrift]);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    startIdleDrift();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      stopIdleDrift();
      if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    };
  }, [handlePointerMove, startIdleDrift, stopIdleDrift]);
}
