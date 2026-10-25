import React, { createContext, useContext, useState } from 'react';
import {
  isSoundEnabled,
  setSoundEnabled as persistSoundEnabled,
  isSoundMuted,
  setSoundMuted as persistSoundMuted
} from '../utils/audioWhistle';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface VoiceContextType {
  voiceState: VoiceState;
  setVoiceState: React.Dispatch<React.SetStateAction<VoiceState>>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  readAloud: boolean;
  setReadAloud: (read: boolean) => void;
  voiceError: string | null;
  setVoiceError: (err: string | null) => void;
  ariaLiveText: string;
  setAriaLiveText: (text: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  // Global sound toggle: off by default, saved in localStorage
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => isSoundEnabled());
  const [readAloud, setReadAloudState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('brassline_read_aloud') === 'true';
    } catch {
      return false;
    }
  });
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [ariaLiveText, setAriaLiveText] = useState<string>('Stationmaster Abernathy telegraph ready.');

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    persistSoundEnabled(enabled);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const setIsMuted = (muted: boolean) => {
    setSoundEnabled(!muted);
  };

  const toggleMute = () => {
    toggleSound();
  };

  const setReadAloud = (read: boolean) => {
    setReadAloudState(read);
    try {
      localStorage.setItem('brassline_read_aloud', read ? 'true' : 'false');
    } catch {}
  };

  const isMuted = !soundEnabled;

  return (
    <VoiceContext.Provider
      value={{
        voiceState,
        setVoiceState,
        soundEnabled,
        setSoundEnabled,
        toggleSound,
        isMuted,
        setIsMuted,
        toggleMute,
        readAloud,
        setReadAloud,
        voiceError,
        setVoiceError,
        ariaLiveText,
        setAriaLiveText
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export function useVoiceContext(): VoiceContextType {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    return {
      voiceState: 'idle',
      setVoiceState: () => {},
      soundEnabled: false,
      setSoundEnabled: () => {},
      toggleSound: () => {},
      isMuted: true,
      setIsMuted: () => {},
      toggleMute: () => {},
      readAloud: false,
      setReadAloud: () => {},
      voiceError: null,
      setVoiceError: () => {},
      ariaLiveText: '',
      setAriaLiveText: () => {}
    };
  }
  return ctx;
}
