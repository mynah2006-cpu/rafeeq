// ============================================================
// RAFEEQ — Voice Store (Zustand)
//
// Only stores cross-cutting voice state that multiple
// components need to read (emergency flag, error message).
// Transient state (isListening, transcript) stays in hooks.
// ============================================================

import { create } from 'zustand';

import type { ConversationMessage } from '../types';

interface VoiceStore {
  /** True when an emergency keyword was detected */
  isEmergency: boolean;
  setIsEmergency: (value: boolean) => void;
  dismissEmergency: () => void;

  /** Human-readable error message, null when no error */
  voiceError: string | null;
  setVoiceError: (error: string | null) => void;

  /** Conversation history */
  conversation: ConversationMessage[];
  addMessage: (msg: Omit<ConversationMessage, 'id' | 'timestamp'>) => void;
  clearConversation: () => void;

  /** The latest AI response text (for typewriter display) */
  lastResponse: string;
  setLastResponse: (text: string) => void;
}

let msgId = 0;

export const useVoiceStore = create<VoiceStore>((set) => ({
  isEmergency: false,
  setIsEmergency: (value) => set({ isEmergency: value }),
  dismissEmergency: () => set({ isEmergency: false }),

  voiceError: null,
  setVoiceError: (error) => set({ voiceError: error }),

  conversation: [],
  addMessage: (msg) =>
    set((s) => ({
      conversation: [
        ...s.conversation,
        { ...msg, id: `msg-${++msgId}`, timestamp: Date.now() },
      ],
    })),
  clearConversation: () => set({ conversation: [] }),

  lastResponse: '',
  setLastResponse: (text) => set({ lastResponse: text }),
}));
