// ============================================================
// RAFEEQ — Emergency Detector
//
// CRITICAL SAFETY REQUIREMENT:
// Emergency detection runs BEFORE any LLM call and BEFORE any
// other processing. It is purely string-matching — no AI, no
// network, no latency. It must be instantaneous.
//
// If ANY phrase matches, the full emergency workflow triggers
// regardless of context.
// ============================================================

/**
 * Phrases that trigger the emergency workflow.
 *
 * Design principles:
 * - Include all realistic ways a patient in distress would call for help,
 *   including incomplete or grammatically loose speech.
 * - Avoid single ambiguous words ("sick", "help", "blood") that fire during
 *   normal conversation.
 * - Prefer short anchored phrases that cannot appear in casual talk.
 */
const EMERGENCY_PHRASES: readonly string[] = [
  // ── Direct calls for the care team ──────────────────────────────
  'call the nurse', 'call a nurse', 'get the nurse', 'get a nurse',
  'call the doctor', 'call a doctor', 'get the doctor', 'get a doctor',
  'call for help', 'call 911', 'call an ambulance',
  'get help', 'need a nurse', 'need the nurse', 'need a doctor', 'need the doctor',
  'send someone', 'send a nurse', 'where is the nurse', 'where is the doctor',
  'nurse please', 'doctor please',

  // ── General distress / pain ──────────────────────────────────────
  'i am in pain', "i'm in pain", 'so much pain', 'a lot of pain',
  'really hurts', 'it hurts so much', 'hurts a lot', 'hurts really bad',
  'severe pain', 'extreme pain', 'unbearable pain', 'terrible pain',
  'i need help', 'please help me', 'help me please', 'somebody help',
  'someone help', 'help me', 'i need assistance',

  // ── Breathing / cardiac ──────────────────────────────────────────
  "can't breathe", 'cannot breathe', 'hard to breathe', 'trouble breathing',
  'difficulty breathing', 'short of breath',
  'chest pain', 'chest hurts', 'my chest', 'heart attack',
  'my heart is', 'heart is racing', 'heart is pounding',

  // ── Nausea / vomiting ────────────────────────────────────────────
  'i am going to vomit', 'i need to vomit', 'going to be sick',
  'feeling nauseous', 'feel nauseous', 'i feel nauseous',

  // ── Consciousness / dizziness ────────────────────────────────────
  'feeling faint', 'going to faint', 'going to pass out', 'about to pass out',
  'i feel dizzy', 'very dizzy', 'so dizzy', 'i am dizzy',
  'everything is spinning', 'i am losing', 'losing consciousness',

  // ── Severe illness ───────────────────────────────────────────────
  'i feel very sick', 'feeling very sick', 'really sick', 'very sick',
  'i am very sick', "i'm very sick",
  'i feel terrible', 'i feel awful',

  // ── Bleeding / injury ────────────────────────────────────────────
  'i am bleeding', "i'm bleeding", 'there is blood', 'bleeding badly',
  'i fell down', 'i have fallen', 'i fell off', 'i fell out of',

  // ── Critical ─────────────────────────────────────────────────────
  'i am dying', "i'm dying", 'i think i am dying', 'i think i might die',
  'emergency', 'this is an emergency',
];

/**
 * Sanitizes text for reliable matching.
 * Removes punctuation, lowercases, collapses whitespace.
 */
function sanitize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if the transcript contains an emergency phrase.
 * This check is O(n) string matching — no async, no network.
 */
export function detectEmergency(transcript: string): boolean {
  const clean = sanitize(transcript);
  return EMERGENCY_PHRASES.some((phrase) => clean.includes(phrase));
}

/** The exact text Rafeeq speaks when an emergency is detected */
export const EMERGENCY_RESPONSE =
  "Hey, I've got you. I'm calling the team right now — they're on their way. " +
  "Just breathe. Stay with me. You're not alone.";
