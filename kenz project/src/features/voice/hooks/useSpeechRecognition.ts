// ============================================================
// RAFEEQ — useSpeechRecognition Hook
//
// Wraps the Web Speech API SpeechRecognition interface.
// Handles interim results, final transcripts, errors, and
// browser compatibility gracefully.
//
// Returns stable function references so callers don't need
// to list them in useEffect dependency arrays.
// ============================================================

import { useRef, useState, useCallback, useEffect } from 'react';
import type { SpeechError } from '../../../types';

// Type-safe access to SpeechRecognition across browsers.
// Chrome uses webkitSpeechRecognition; standard name is not yet in all TS DOM libs.
type SpeechRecognitionConstructor = new () => SpeechRecognition;

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function getSpeechRecognitionAPI(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as WindowWithSpeech;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechRecognitionState {
  /** The most recent final (committed) transcript */
  transcript: string;
  /** Live in-progress speech, updates as user speaks */
  interim: string;
  /** True while the microphone is actively recording */
  isListening: boolean;
  /** False if the browser doesn't support the Web Speech API */
  isSupported: boolean;
  /** Null when no error; a specific code string on failure */
  error: SpeechError | null;
  /** Start recording. Safe to call even if already listening. */
  startListening: () => void;
  /** Stop recording early. Safe to call if not listening. */
  stopListening: () => void;
}

const ERROR_MAP: Partial<Record<string, SpeechError>> = {
  'not-allowed':   'not-allowed',
  'no-speech':     'no-speech',
  'audio-capture': 'audio-capture',
  'network':       'network',
  'aborted':       'aborted',
};

export function useSpeechRecognition(lang = 'en-US'): SpeechRecognitionState {
  const SpeechRecognitionAPI = getSpeechRecognitionAPI();
  const isSupported = SpeechRecognitionAPI !== null;

  const recognitionRef  = useRef<SpeechRecognition | null>(null);
  const isListeningRef  = useRef(false); // Ref for use inside callbacks

  const [transcript, setTranscript] = useState('');
  const [interim,    setInterim]    = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error,       setError]       = useState<SpeechError | null>(null);

  // Build the recognition instance once
  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const rec = new SpeechRecognitionAPI();
    rec.continuous      = true;   // Keep listening until manually stopped or forced to restart
    rec.interimResults  = true;   // Show live partial text
    rec.lang            = lang;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      setError(null);
      setTranscript('');
      setInterim('');
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalText   = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (interimText) setInterim(interimText);
      if (finalText) {
        setTranscript(finalText.trim());
        setInterim('');
      }
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      const mapped = ERROR_MAP[event.error] ?? 'unknown';
      // 'aborted' is fired when we call .stop() intentionally
      // 'no-speech' is fired when the user is silent. We ignore it so continuous mode isn't broken.
      if (mapped !== 'aborted' && mapped !== 'no-speech') {
        setError(mapped);
      }
      isListeningRef.current = false;
      setIsListening(false);
      setInterim('');
    };

    rec.onend = () => {
      isListeningRef.current = false;
      setIsListening(false);
      setInterim('');
    };

    recognitionRef.current = rec;

    return () => {
      rec.abort();
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionAPI, lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
    } catch {
      // Silently ignore "already started" DOMException
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return;
    recognitionRef.current.stop();
  }, []);

  return {
    transcript,
    interim,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}
