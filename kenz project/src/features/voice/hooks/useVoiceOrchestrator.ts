// ============================================================
// RAFEEQ — useVoiceOrchestrator Hook
//
// The single point of coordination for the entire voice pipeline.
// It wires together:
//   STT → Emergency Detection → Response Engine → TTS
//
// Face state transitions follow this sequence:
//   idle → listening → thinking → speaking → idle
//
// Self-echo prevention & Full-Duplex:
//   - The microphone STAYS ON continuously.
//   - isSelfEcho() filters out transcripts that mirror Rafeeq's last response.
//   - If the user interrupts (speaks unique words), TTS is cancelled immediately.
// ============================================================

import { useEffect, useCallback, useRef } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useFaceStore } from '../../../store/faceStore';
import { useVoiceStore } from '../../../store/voiceStore';
import { detectEmergency, EMERGENCY_RESPONSE } from '../emergencyDetector';
import { getGeminiResponse } from '../llmEngine';
import {
  playStartSound,
  playStopSound,
  playErrorSound,
  playEmergencySound,
  playThinkingSound,
} from '../../../shared/utils/soundEffects';
import type { SpeechError } from '../../../types';

/** Milliseconds of "thinking" face before speaking — adds realism */
const THINKING_DELAY_MS = 0;

/** Minimum transcript length to process — guards against ambient noise. */
const MIN_TRANSCRIPT_LENGTH = 3;

const SPEECH_ERROR_MESSAGES: Partial<Record<SpeechError, string>> = {
  'not-allowed':
    "I can't hear you — it looks like microphone access was blocked. You may need to allow it in your browser settings.",
  'no-speech':
    "I didn't catch that. Whenever you're ready, just try again.",
  'audio-capture':
    "I don't seem to have access to a microphone. Is one connected?",
  'network':
    "Something's off with the connection. Give it a moment and try again.",
};

// ----------------------------------------------------------------
// Layer 2: Transcript self-echo similarity filter
//
// Purpose: prevent the mic picking up Rafeeq's own TTS voice and
// re-processing it as a new user utterance.
//
// Rules:
//  - Only apply to normal (non-emergency) responses.
//  - Require at least 6 words in the transcript before filtering —
//    short distress phrases must always reach the detector.
//  - Raise the overlap threshold to 0.80 so only near-verbatim
//    repeats are caught, not coincidental word matches.
// ----------------------------------------------------------------
function isSelfEcho(transcript: string, lastResponse: string): boolean {
  if (!lastResponse || !transcript) return false;

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

  const transcriptWords = normalize(transcript);

  // Never suppress short phrases — any utterance under 6 words goes
  // straight through so distress calls are never accidentally dropped.
  if (transcriptWords.length < 6) return false;

  const responseWords = new Set(normalize(lastResponse));
  const overlap = transcriptWords.filter(w => responseWords.has(w)).length;
  const ratio = overlap / transcriptWords.length;

  // 0.80 threshold: must be >80% identical to be considered an echo.
  return ratio > 0.80;
}

export interface VoiceOrchestratorState {
  interim: string;
  transcript: string;
  isListening: boolean;
  isSpeaking: boolean;
  isUnsupported: boolean;
  toggleListening: () => void;
}

export function useVoiceOrchestrator(): VoiceOrchestratorState {
  const setFaceState     = useFaceStore((s) => s.setFaceState);
  const setIsMicActive   = useFaceStore((s) => s.setIsMicActive);
  const setMouthOpenness = useFaceStore((s) => s.setMouthOpenness);

  const setIsEmergency   = useVoiceStore((s) => s.setIsEmergency);
  const setVoiceError    = useVoiceStore((s) => s.setVoiceError);
  const addMessage       = useVoiceStore((s) => s.addMessage);
  const setLastResponse  = useVoiceStore((s) => s.setLastResponse);
  const conversation     = useVoiceStore((s) => s.conversation);
  const lastResponse     = useVoiceStore((s) => s.lastResponse);

  // Continuous mode flag
  const isActiveRef = useRef(false);

  // Guard so the emergency sound + TTS fire exactly ONCE per incident
  const emergencyFiredRef = useRef(false);

  // When the user dismisses the emergency overlay, reset the guard
  // so a real second emergency later in the same session is handled
  const isEmergency = useVoiceStore((s) => s.isEmergency);
  useEffect(() => {
    if (!isEmergency) {
      emergencyFiredRef.current = false;
    }
  }, [isEmergency]);

  // Echo-filter baseline: only updated by normal conversational responses,
  // NEVER by the emergency response text (which contains words the patient
  // is likely to say again: "you", "me", "with", "calling", etc.).
  const echoBaselineRef = useRef('');

  const lastResponseRef = useRef(lastResponse);
  useEffect(() => { lastResponseRef.current = lastResponse; }, [lastResponse]);

  // Mouth sync
  const wordCountRef = useRef(0);
  const handleWordBoundary = useCallback(() => {
    wordCountRef.current++;
    const isEmphasis = wordCountRef.current % 4 === 0;
    const openAmount = isEmphasis
      ? 0.85 + Math.random() * 0.15
      : 0.45 + Math.random() * 0.4;
    const decayTime = isEmphasis ? 140 : 80 + Math.random() * 60;

    setMouthOpenness(openAmount);
    setTimeout(() => setMouthOpenness(0.1 + Math.random() * 0.2), decayTime);
  }, [setMouthOpenness]);

  const { speak, cancelSpeech, isSpeaking } = useSpeechSynthesis(handleWordBoundary);

  const {
    transcript,
    interim,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const speakRef = useRef(speak);
  useEffect(() => { speakRef.current = speak; }, [speak]);

  const cancelSpeechRef = useRef(cancelSpeech);
  useEffect(() => { cancelSpeechRef.current = cancelSpeech; }, [cancelSpeech]);

  // ----------------------------------------------------------------
  // Face state coordination
  // ----------------------------------------------------------------
  useEffect(() => {
    if (isSpeaking) {
      setFaceState('speaking');
    } else if (isListening) {
      setFaceState('listening');
      setIsMicActive(true);
      setVoiceError(null);
    } else {
      const timer = setTimeout(() => {
        setFaceState('idle');
        setMouthOpenness(0);
        setIsMicActive(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, isListening, setFaceState, setMouthOpenness, setIsMicActive, setVoiceError]);

  // Play start sound only when mic toggles on from off
  const prevListening = useRef(false);
  useEffect(() => {
    if (isListening && !prevListening.current) playStartSound();
    prevListening.current = isListening;
  }, [isListening]);

  // Error handling
  useEffect(() => {
    if (!error) return;
    const message = SPEECH_ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.';
    setVoiceError(message);
    setFaceState('concerned');
    setIsMicActive(false);
    playErrorSound();
  }, [error, setFaceState, setIsMicActive, setVoiceError]);

  // ----------------------------------------------------------------
  // Process final transcript
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!transcript) return;

    if (transcript.trim().length < MIN_TRANSCRIPT_LENGTH) {
      return;
    }

    if (isSelfEcho(transcript, echoBaselineRef.current)) {
      return; // Discard echo
    }

    // INTERRUPTION LOGIC: If a valid user transcript comes in while
    // Rafeeq is speaking, instantly cancel his current speech!
    cancelSpeechRef.current();

    setIsMicActive(false);
    addMessage({ role: 'patient', content: transcript });

    if (detectEmergency(transcript)) {
      setIsEmergency(true);
      setFaceState('concerned');

      // Only fire the alert sound + TTS once per incident
      if (!emergencyFiredRef.current) {
        emergencyFiredRef.current = true;
        playEmergencySound();
        // DO NOT update echoBaselineRef here — the emergency response text
        // contains words the patient is likely to say next ("you", "me",
        // "with", "calling") and would cause the echo filter to drop real
        // follow-up distress phrases. Only update the store for display.
        setLastResponse(EMERGENCY_RESPONSE);
        addMessage({ role: 'assistant', content: EMERGENCY_RESPONSE, emotion: 'concerned' });
        speakRef.current(EMERGENCY_RESPONSE);
      }
      return;
    }

    setFaceState('thinking');
    playThinkingSound();

    let timer: ReturnType<typeof setTimeout>;
    const processResponse = async () => {
      const { text, positive } = await getGeminiResponse(transcript, conversation);

      // Update the echo-filter baseline ONLY for normal conversational responses
      echoBaselineRef.current = text;
      setLastResponse(text);
      addMessage({
        role: 'assistant',
        content: text,
        emotion: positive ? 'happy' : 'idle',
      });
      
      timer = setTimeout(() => {
        if (positive) {
          setFaceState('happy');
          setTimeout(() => speakRef.current(text), 400);
        } else {
          speakRef.current(text);
        }
      }, THINKING_DELAY_MS);
    };

    processResponse();
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, setFaceState, setIsMicActive, setIsEmergency, addMessage, setLastResponse]);

  // ----------------------------------------------------------------
  // Auto-restart listening in continuous mode
  // The mic stays ON. This only triggers if the browser naturally times out.
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!isListening && !error && isActiveRef.current) {
      const timer = setTimeout(() => {
        startListening();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isListening, error, startListening]);

  // ----------------------------------------------------------------
  // Toggle function
  // ----------------------------------------------------------------
  const toggleListening = useCallback(() => {
    if (isActiveRef.current) {
      isActiveRef.current = false;
      playStopSound();
      stopListening();
      cancelSpeech();
      setFaceState('idle');
      setMouthOpenness(0);
      setIsMicActive(false);
      setIsEmergency(false); // Dismiss emergency if user turns off the mic
      emergencyFiredRef.current = false; // Reset for next session
    } else {
      isActiveRef.current = true;
      emergencyFiredRef.current = false; // Fresh session
      echoBaselineRef.current = '';      // Clear stale echo baseline
      startListening();
    }
  }, [
    stopListening, startListening, cancelSpeech,
    setFaceState, setMouthOpenness, setIsMicActive, setIsEmergency,
  ]);

  return {
    interim,
    transcript,
    isListening,
    isSpeaking,
    isUnsupported: !isSupported,
    toggleListening,
  };
}
