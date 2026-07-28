// ============================================================
// RAFEEQ — App Root (Phase 2: Voice Pipeline Active)
// ============================================================

import { useState } from 'react';
import { useFaceStore } from './store/faceStore';
import { useVoiceStore } from './store/voiceStore';
import { useVoiceOrchestrator } from './features/voice/hooks/useVoiceOrchestrator';
import { useExpressionCycle } from './features/face/animations/useExpressionCycle';

import { SplashOverlay }     from './shared/components/SplashOverlay';
import { ParticleBackground } from './shared/components/ParticleBackground';
import { AudioVisualizer }   from './shared/components/AudioVisualizer';
import { RafeeqFace }        from './features/face/components/RafeeqFace';
import { MicButton }         from './features/voice/components/MicButton';
import { TranscriptDisplay } from './features/voice/components/TranscriptDisplay';
import { PrivacyIndicator }  from './features/voice/components/PrivacyIndicator';
import { EmergencyOverlay }  from './features/emergency/EmergencyOverlay';
import { StatusBar }         from './shared/components/StatusBar';
import { Dashboard }         from './features/dashboard/Dashboard';
import { LayoutDashboard, UserRound } from 'lucide-react';

import styles from './App.module.css';

const STATE_LABELS: Record<string, string> = {
  idle:      'Tap the mic — I\'m here',
  listening: 'I\'m listening…',
  thinking:  'Hmm, let me think…',
  speaking:  'Talking…',
  happy:     'That makes me happy!',
  concerned: 'I\'m right here with you.',
  surprised: 'Oh wow, really?',
  sleeping:  'Resting quietly…',
};

export default function App() {
  const [view, setView] = useState<'companion' | 'dashboard'>('dashboard');
  
  const faceState    = useFaceStore((s) => s.faceState);
  const voiceError   = useVoiceStore((s) => s.voiceError);
  const isEmergency  = useVoiceStore((s) => s.isEmergency);

  const {
    interim,
    transcript,
    isListening,
    isSpeaking,
    isUnsupported,
    toggleListening,
  } = useVoiceOrchestrator();

  // Automatically cycle face expressions when idle — stops the moment
  // the voice pipeline takes control (listening / speaking / emergency).
  useExpressionCycle({
    isActive: !isListening && !isSpeaking && !isEmergency && view === 'companion',
  });

  return (
    <>
      {/* View Toggle Button */}
      <button 
        onClick={() => setView(v => v === 'companion' ? 'dashboard' : 'companion')}
        className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur shadow-lg border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all hover:scale-105"
      >
        {view === 'companion' ? <LayoutDashboard size={18} className="text-blue-600" /> : <UserRound size={18} className="text-blue-600" />}
        {view === 'companion' ? 'Staff Dashboard' : 'Companion Mode'}
      </button>

      {view === 'dashboard' ? (
        <Dashboard />
      ) : (
        <>
          {/* === Splash on first load === */}
          <SplashOverlay />

          {/* === Particle background === */}
          <ParticleBackground />

          {/* === Dynamic ambient glow behind face === */}
          <div
            className={styles.ambientGlow}
            data-state={faceState}
            aria-hidden="true"
          />

          {/* === Privacy indicator — MUST be visible when mic is on === */}
          <PrivacyIndicator isActive={isListening} />

          {/* === Emergency overlay === */}
          <EmergencyOverlay />

          <main className={styles.main}>
            {/* --- Header --- */}
            <header className={styles.header}>
              <div className={styles.logoMark} aria-hidden="true">ر</div>
              <div className={styles.titleGroup}>
                <h1 className={styles.title}>Rafeeq</h1>
                <p className={styles.subtitle}>Your companion</p>
              </div>
            </header>

            {/* --- Face + transcript region --- */}
            <section className={styles.stage} aria-label="Animated companion face">
              <RafeeqFace />

              {/* State label — re-mounts on change to trigger fade-in animation */}
              <p
                key={faceState}
                className={styles.stateLabel}
                aria-live="polite"
                aria-atomic="true"
              >
                {STATE_LABELS[faceState]}
              </p>
            </section>

            {/* --- Live transcript --- */}
            <div className={styles.transcriptRegion}>
              <TranscriptDisplay
                interim={interim}
                transcript={transcript}
                isListening={isListening}
                isSpeaking={isSpeaking}
              />
            </div>

            {/* --- Audio visualizer --- */}
            <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} />

            {/* --- Voice controls --- */}
            <section className={styles.voiceSection} aria-label="Voice controls">
              <MicButton
                isListening={isListening}
                isSpeaking={isSpeaking}
                isUnsupported={isUnsupported}
                onToggle={toggleListening}
              />

              {/* Error message */}
              {voiceError && (
                <p className={styles.errorMsg} role="alert" aria-live="assertive">
                  {voiceError}
                </p>
              )}

              {/* Unsupported browser message */}
              {isUnsupported && (
                <p className={styles.unsupportedMsg}>
                  Voice requires Chrome, Edge, or Safari with microphone access.
                </p>
              )}
            </section>

            {/* --- Dev state controls --- */}
            <footer className={styles.footer}>
              <StatusBar />
              <p className={styles.devNote}>Keys 1 – 8 · Mic button · or speak naturally</p>
            </footer>
          </main>
        </>
      )}
    </>
  );
}
