import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
}

const BAR_COUNT = 32;

/**
 * Audio visualizer — symmetric waveform bars.
 * Uses simulated waveforms (no duplicate mic access) synced to state.
 * Listening: randomized energy bars. Speaking: layered sine waves.
 */
export function AudioVisualizer({ isListening, isSpeaking }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const levelsRef = useRef<Float32Array>(new Float32Array(BAR_COUNT).fill(0));
  const targetRef = useRef<Float32Array>(new Float32Array(BAR_COUNT).fill(0));

  useEffect(() => {
    function resize(cvs: HTMLCanvasElement) {
      cvs.width = cvs.clientWidth * devicePixelRatio;
      cvs.height = cvs.clientHeight * devicePixelRatio;
    }

    function animate() {
      const cvs = canvasRef.current;
      if (!cvs) { rafRef.current = requestAnimationFrame(animate); return; }
      const c = cvs.getContext('2d');
      if (!c) { rafRef.current = requestAnimationFrame(animate); return; }

      const w = cvs.clientWidth;
      const h = cvs.clientHeight;

      c.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      c.clearRect(0, 0, w, h);

      const targets = targetRef.current;
      const levels = levelsRef.current;

      if (isListening) {
        // Simulated mic energy — randomized with bias toward middle bars
        const t = performance.now() / 1000;
        for (let i = 0; i < BAR_COUNT; i++) {
          const center = 1 - Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
          targets[i] = 0.1 + center * 0.6 * (
            0.5 + 0.3 * Math.sin(t * 4.5 + i * 0.8) +
            0.2 * Math.sin(t * 7.3 + i * 1.2) +
            Math.random() * 0.25
          );
        }
      } else if (isSpeaking) {
        const t = performance.now() / 1000;
        for (let i = 0; i < BAR_COUNT; i++) {
          const phase = (i / BAR_COUNT) * Math.PI * 2;
          targets[i] = 0.25 + 0.5 * (
            0.4 * Math.sin(t * 3.2 + phase) +
            0.3 * Math.sin(t * 5.7 + phase * 1.5) +
            0.2 * Math.sin(t * 8.1 + phase * 0.7)
          );
        }
      } else {
        targets.fill(0);
      }

      // Smooth interpolation
      for (let i = 0; i < BAR_COUNT; i++) {
        levels[i] += (targets[i] - levels[i]) * 0.18;
      }

      const barW = w / BAR_COUNT;
      const gap = 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        const barH = Math.max(levels[i] * h * 0.75, 1.5);
        const x = i * barW + gap / 2;
        const y = (h - barH) / 2;

        const hue = isListening ? 185 : 178;
        const alpha = 0.25 + levels[i] * 0.65;

        c.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        c.beginPath();
        c.roundRect(x, y, barW - gap, barH, [barW / 3]);
        c.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    const cvs = canvasRef.current;
    if (cvs) resize(cvs);

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isListening, isSpeaking]);

  if (!isListening && !isSpeaking) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        maxWidth: 340,
        height: 48,
        display: 'block',
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
}
