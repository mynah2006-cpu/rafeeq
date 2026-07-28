// ============================================================
// RAFEEQ — Sound Effects (Warm, Musical Tones)
//
// All UI sounds are generated via Web Audio API oscillators.
// Tuned to be warm, gentle, and non-alarming — appropriate
// for a hospital environment with patients at rest.
// ============================================================

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.06,
  rampDown = true,
) {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    if (rampDown) {
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    }
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio context not available — silent fallback
  }
}

/** Mic activated — gentle ascending chime (C5 → E5) */
export function playStartSound() {
  playTone(523, 0.1, 'sine', 0.05);      // C5
  setTimeout(() => playTone(659, 0.12, 'sine', 0.04), 90); // E5
}

/** Mic deactivated — soft descending (E5 → C5) */
export function playStopSound() {
  playTone(659, 0.08, 'sine', 0.04);     // E5
  setTimeout(() => playTone(523, 0.1, 'sine', 0.03), 70);  // C5
}

/** Error — soft low tone, not alarming */
export function playErrorSound() {
  playTone(330, 0.12, 'triangle', 0.04);  // E4
  setTimeout(() => playTone(262, 0.15, 'triangle', 0.03), 130); // C4
}

/** Emergency — repeating urgent tone, clearly different */
export function playEmergencySound() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      playTone(880, 0.12, 'square', 0.05);  // A5
      setTimeout(() => playTone(660, 0.12, 'square', 0.04), 130); // E5
    }, i * 320);
  }
}

/** Thinking — subtle single tap */
export function playThinkingSound() {
  playTone(440, 0.05, 'sine', 0.025);    // A4 — barely audible
}
