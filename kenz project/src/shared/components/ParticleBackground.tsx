import { useEffect, useRef } from 'react';

/**
 * ParticleBackground — refined ambient field
 *
 * Design principles:
 * - Particles move on smooth Lissajous-like paths (perlin-free sine superposition),
 *   never teleport, never jitter.
 * - Three tiers: large slow nebula blobs, medium drifting orbs, tiny sparkles.
 * - No hard node-connection lines — instead, very faint radial halos only.
 * - Hue sits in the deep cyan-blue range (195–215°) to complement the face colour
 *   without competing with it.
 * - Everything is drawn at sub-pixel opacity so the canvas is nearly invisible
 *   in periphery but just alive enough to feel like a living space.
 */

interface Particle {
  // Position (canvas coords)
  cx: number;
  cy: number;
  // Amplitude of the orbit ellipse
  ax: number;
  ay: number;
  // Phase offsets so particles don't synchronise
  phaseX: number;
  phaseY: number;
  // Drift frequencies (radians / ms)
  freqX: number;
  freqY: number;
  // Opacity oscillation
  alpha: number;
  alphaBase: number;
  alphaAmp: number;
  alphaFreq: number;
  alphaPhase: number;
  // Visual
  radius: number;
  hue: number;
  tier: 0 | 1 | 2; // 0=nebula 1=orb 2=sparkle
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const TIERS = [
  { count: 6,  rMin: 80,  rMax: 130, freqScale: 0.000018, alphaMax: 0.07,  glowMult: 9 },
  { count: 18, rMin: 2.5, rMax: 5,   freqScale: 0.000055, alphaMax: 0.22,  glowMult: 6 },
  { count: 30, rMin: 0.7, rMax: 1.8, freqScale: 0.000090, alphaMax: 0.35,  glowMult: 4 },
];

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Resize ────────────────────────────────────────────── */
    function resize() {
      const cvs = canvasRef.current;
      if (!cvs) return;
      cvs.width  = window.innerWidth  * devicePixelRatio;
      cvs.height = window.innerHeight * devicePixelRatio;
      cvs.style.width  = `${window.innerWidth}px`;
      cvs.style.height = `${window.innerHeight}px`;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Spawn particles ───────────────────────────────────── */
    const particles: Particle[] = [];
    const w = () => canvasRef.current?.width  ?? window.innerWidth  * devicePixelRatio;
    const h = () => canvasRef.current?.height ?? window.innerHeight * devicePixelRatio;

    TIERS.forEach((tier, tierIdx) => {
      for (let i = 0; i < tier.count; i++) {
        const cx = rand(0.1, 0.9) * w();
        const cy = rand(0.1, 0.9) * h();
        const orbitScale = Math.min(w(), h());
        particles.push({
          cx, cy,
          ax: rand(0.03, 0.12) * orbitScale,
          ay: rand(0.03, 0.12) * orbitScale,
          phaseX: rand(0, Math.PI * 2),
          phaseY: rand(0, Math.PI * 2),
          freqX: tier.freqScale * rand(0.6, 1.4),
          freqY: tier.freqScale * rand(0.6, 1.4),
          alpha: rand(0.02, tier.alphaMax),
          alphaBase: rand(tier.alphaMax * 0.3, tier.alphaMax * 0.7),
          alphaAmp:  rand(tier.alphaMax * 0.15, tier.alphaMax * 0.35),
          alphaFreq: rand(0.00008, 0.00022),
          alphaPhase: rand(0, Math.PI * 2),
          radius: rand(tier.rMin, tier.rMax),
          hue: rand(195, 215),
          tier: tierIdx as 0 | 1 | 2,
        });
      }
    });
    particlesRef.current = particles;

    /* ── Draw loop ─────────────────────────────────────────── */
    function draw(now: number) {
      const cvs = canvasRef.current;
      if (!cvs) { rafRef.current = requestAnimationFrame(draw); return; }
      const ctx = cvs.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(draw); return; }

      const cw = cvs.width;
      const ch = cvs.height;
      ctx.clearRect(0, 0, cw, ch);

      for (const p of particlesRef.current) {
        // Smooth orbital position (Lissajous)
        const px = p.cx + p.ax * Math.sin(now * p.freqX + p.phaseX);
        const py = p.cy + p.ay * Math.sin(now * p.freqY + p.phaseY);

        // Breathing alpha
        const a = p.alphaBase + p.alphaAmp * Math.sin(now * p.alphaFreq + p.alphaPhase);

        if (p.tier === 0) {
          // Nebula blob — large soft radial gradient, very dim
          const glowR = p.radius * 8;
          const grd = ctx.createRadialGradient(px, py, 0, px, py, glowR);
          grd.addColorStop(0,   `hsla(${p.hue}, 70%, 65%, ${a * 0.5})`);
          grd.addColorStop(0.4, `hsla(${p.hue}, 60%, 55%, ${a * 0.15})`);
          grd.addColorStop(1,   `hsla(${p.hue}, 50%, 50%, 0)`);
          ctx.beginPath();
          ctx.arc(px, py, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        } else {
          // Orb / sparkle — tight core + soft outer halo
          const glowR = p.radius * TIERS[p.tier].glowMult;
          const grd = ctx.createRadialGradient(px, py, 0, px, py, glowR);
          grd.addColorStop(0,   `hsla(${p.hue}, 90%, 80%, ${a})`);
          grd.addColorStop(0.3, `hsla(${p.hue}, 85%, 75%, ${a * 0.4})`);
          grd.addColorStop(1,   `hsla(${p.hue}, 80%, 70%, 0)`);

          // Halo
          ctx.beginPath();
          ctx.arc(px, py, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          // Hard core dot
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 95%, 90%, ${Math.min(a * 1.5, 0.9)})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
