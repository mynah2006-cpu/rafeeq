// ============================================================
// RAFEEQ — Shared Type Definitions
// ============================================================

/** All possible animation states the face can occupy */
export type FaceState =
  | 'idle'       // Default resting state
  | 'listening'  // User is speaking
  | 'thinking'   // AI is processing
  | 'speaking'   // AI is responding
  | 'happy'      // Positive emotional reaction
  | 'concerned'  // Expressing care / worry
  | 'surprised'  // Reacting to unexpected input
  | 'sleeping';  // Low-activity / screensaver state

/** Pupil tracking target in normalized [-1, 1] coordinate space */
export interface PupilTarget {
  x: number;
  y: number;
}

/** Conversation message roles */
export type MessageRole = 'patient' | 'assistant' | 'system';

/** A single turn in the conversation */
export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  emotion?: FaceState;
}

/** Application language */
export type AppLanguage = 'en' | 'ar';

// ============================================================
// Voice Pipeline Types
// ============================================================

/**
 * Possible errors from the Web Speech API.
 * Maps directly to SpeechRecognitionErrorEvent.error codes.
 */
export type SpeechError =
  | 'not-allowed'    // User denied microphone permission
  | 'no-speech'      // No speech detected within timeout
  | 'audio-capture'  // No microphone found
  | 'network'        // Network failure (cloud recognition)
  | 'aborted'        // Recognition was aborted
  | 'unsupported'    // Browser does not support Web Speech API
  | 'unknown';       // Catch-all for unexpected errors

/** Severity level of a detected situation */
export type EmergencyLevel = 'none' | 'detected';
