// ============================================================
// RAFEEQ — useSpeechSynthesis Hook (Cinematic TTS)
//
// ElevenLabs primary (with simulated lip-sync via audio analysis),
// Web Speech API fallback with optimized voice selection.
// ============================================================

import { useRef, useState, useCallback, useEffect } from 'react';

export interface SpeechSynthesisState {
  speak: (text: string, lang?: 'en' | 'ar') => void;
  cancelSpeech: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB'; // Adam - Calm, confident male voice

const PREFERRED_VOICE_NAMES = [
  'Microsoft Ryan Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Microsoft Christopher Online (Natural)',
  'Microsoft Brian Online (Natural)',
  'Microsoft Guy Online',
  'Google UK English Male',
  'Google US English Male',
  'Daniel', 'Alex', 'Tom', 'Fred',
  // Fallbacks
  'Microsoft Aria Online (Natural)',
  'Google US English',
  'Samantha', 'Victoria',
];

function selectVoice(lang: 'en' | 'ar'): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const langPrefix = lang === 'ar' ? 'ar' : 'en';
  const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));
  const pool = langVoices.length > 0 ? langVoices : voices;

  for (const name of PREFERRED_VOICE_NAMES) {
    const match = pool.find(v => v.name.includes(name));
    if (match) return match;
  }

  return pool.find(v => v.lang.startsWith(langPrefix)) ?? pool[0];
}

function detectLanguage(text: string): 'en' | 'ar' {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicChars > text.length * 0.3 ? 'ar' : 'en';
}

/**
 * Speak via ElevenLabs API with real-time audio analysis for lip-sync.
 * Uses Web Audio API AnalyserNode to drive mouth openness from actual audio.
 */
async function speakElevenLabs(
  text: string,
  onStart: () => void,
  onEnd: () => void,
  onBoundary: () => void,
  abortSignal: AbortSignal,
): Promise<void> {
  if (!ELEVENLABS_API_KEY) return Promise.reject('No API key');

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.65,
        similarity_boost: 0.75,
        style: 0.25,
        use_speaker_boost: true,
      },
    }),
    signal: abortSignal,
  });

  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);

  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();

  // Create audio context for analysis
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;

  // Analyser for real lip-sync
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.6;
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  onStart();

  // Drive mouth via requestAnimationFrame while audio plays
  let rafId: number;
  function analyzeLipSync() {
    analyser.getByteFrequencyData(dataArray);
    // Focus on speech frequencies (200-4000 Hz ≈ bins 2-50 for 256-FFT at 44.1kHz)
    let sum = 0;
    const speechBins = Math.min(50, dataArray.length);
    for (let i = 2; i < speechBins; i++) {
      sum += dataArray[i];
    }
    const avg = sum / (speechBins - 2);
    if (avg > 15) { // Only fire for real speech, not silence
      onBoundary();
    }
    rafId = requestAnimationFrame(analyzeLipSync);
  }

  source.onended = () => {
    cancelAnimationFrame(rafId);
    audioCtx.close();
    onEnd();
  };

  // Handle abort
  const abortHandler = () => {
    source.stop();
    cancelAnimationFrame(rafId);
    audioCtx.close();
    onEnd();
  };
  abortSignal.addEventListener('abort', abortHandler, { once: true });

  source.start();
  rafId = requestAnimationFrame(analyzeLipSync);
}

export function useSpeechSynthesis(
  onWordBoundary?: () => void
): SpeechSynthesisState {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const onWordBoundaryRef = useRef(onWordBoundary);
  useEffect(() => { onWordBoundaryRef.current = onWordBoundary; }, [onWordBoundary]);

  // AbortController for cancellation
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isSupported) return;
    window.speechSynthesis.getVoices();
    const handleVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
  }, [isSupported]);

  const cancelSpeech = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (isSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speak = useCallback((text: string, lang?: 'en' | 'ar') => {
    if (!text.trim()) return;

    // Cancel any in-progress speech
    abortRef.current?.abort();
    if (isSupported) window.speechSynthesis.cancel();

    const detectedLang = lang ?? detectLanguage(text);
    const onStart = () => setIsSpeaking(true);
    const onEnd = () => { setIsSpeaking(false); abortRef.current = null; };
    const onBoundary = () => onWordBoundaryRef.current?.();

    if (ELEVENLABS_API_KEY) {
      const controller = new AbortController();
      abortRef.current = controller;
      speakElevenLabs(text, onStart, onEnd, onBoundary, controller.signal).catch(() => {
        // Fallback to Web Speech on ElevenLabs failure
        if (!controller.signal.aborted) {
          speakWebSpeech(text, detectedLang);
        }
      });
    } else {
      speakWebSpeech(text, detectedLang);
    }

    function speakWebSpeech(txt: string, lng: 'en' | 'ar') {
      if (!isSupported) return;
      const utterance = new SpeechSynthesisUtterance(txt);
      utterance.voice = selectVoice(lng);
      utterance.lang = lng === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate  = 0.92;   // Slightly slower — sounds more present, less machine-gun
      utterance.pitch = 1.05;   // Fractionally warmer than neutral
      utterance.volume = 1.0;
      utterance.onstart = onStart;
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (event.name === 'word') onBoundary();
      };
      window.speechSynthesis.speak(utterance);
    }
  }, [isSupported]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  return { speak, cancelSpeech, isSpeaking, isSupported };
}
