import { useRef, useEffect, useCallback } from 'react';
import { useVoiceContext, VoiceState } from '../context/VoiceContext';
import { playWhistle, playChuff, getOrCreateAudioContext } from '../utils/audioWhistle';
import { primeSpeechSynthesis, speakAbernathyReply, cancelSpeech } from '../utils/speechUtils';

export interface UseVoiceConductorOptions {
  onSendMessage: (text: string, options?: { isVoice?: boolean }) => Promise<void>;
  onInterimSpeech?: (interim: string) => void;
}

export function useVoiceConductor({
  onSendMessage,
  onInterimSpeech
}: UseVoiceConductorOptions) {
  const {
    voiceState,
    setVoiceState,
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    isMuted,
    toggleMute,
    readAloud,
    setReadAloud,
    voiceError,
    setVoiceError,
    ariaLiveText,
    setAriaLiveText
  } = useVoiceContext();

  const recognitionRef = useRef<any>(null);
  const whistleTimeoutRef = useRef<any>(null);
  const lastWasVoiceRef = useRef<boolean>(false);

  // Check browser SpeechRecognition support (Chromium / Safari)
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Clean up all speech & recognition resources on unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (whistleTimeoutRef.current) {
        clearTimeout(whistleTimeoutRef.current);
      }
    };
  }, []);

  const silenceSpeech = useCallback(() => {
    cancelSpeech();
    setVoiceState('idle');
    setAriaLiveText('Stationmaster Abernathy silenced.');
  }, [setVoiceState, setAriaLiveText]);

  const stopListening = useCallback(() => {
    if (whistleTimeoutRef.current) {
      clearTimeout(whistleTimeoutRef.current);
      whistleTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    // Play softer steam chuff when listening stops
    playChuff();
    setVoiceState('idle');
    setAriaLiveText('Speaking-tube closed. Stopped listening.');
  }, [setVoiceState, setAriaLiveText]);

  const startListening = useCallback(() => {
    if (!isSpeechSupported) return;

    setVoiceError(null);

    // 1. iOS Safari autoplay requirement: create or resume AudioContext in user click gesture
    getOrCreateAudioContext();

    // 2. iOS Safari SpeechSynthesis requirement: prime synchronously in user click gesture
    primeSpeechSynthesis();

    // 3. Play Victorian locomotive steam train whistle (Web Audio API)
    playWhistle();

    setVoiceState('listening');
    setAriaLiveText('Speaking-tube open. Listening... Pray speak to the Stationmaster.');

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceState('idle');
      setVoiceError('Voice works best in Chrome or Edge');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = false; // single utterance
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (interimTranscript && onInterimSpeech) {
        onInterimSpeech(interimTranscript);
      }

      if (finalTranscript.trim()) {
        const speechText = finalTranscript.trim();
        lastWasVoiceRef.current = true;
        // Play soft steam chuff when speech finishes and dispatch begins
        playChuff();
        setVoiceState('thinking');
        setAriaLiveText(`Dispatching speech to Stationmaster Abernathy: "${speechText}"`);

        try {
          recognition.stop();
        } catch {}

        onSendMessage(speechText, { isVoice: true });
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[useVoiceConductor] Recognition error:', event.error);
      playChuff();
      setVoiceState('idle');

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        const msg = 'The speaking-tube seems blocked, kindly allow the microphone.';
        setVoiceError(msg);
        setAriaLiveText(msg);
      } else if (event.error === 'no-speech') {
        const msg = 'No voice detected through the speaking-tube. Pray try again.';
        setVoiceError(msg);
        setAriaLiveText(msg);
      } else if (event.error === 'network') {
        const msg = 'The telegraph wire encountered static. Pray check your connection.';
        setVoiceError(msg);
        setAriaLiveText(msg);
      } else if (event.error !== 'aborted') {
        const msg = 'The speaking-tube encountered static. Kindly try again.';
        setVoiceError(msg);
        setAriaLiveText(msg);
      }
    };

    recognition.onend = () => {
      setVoiceState((current: VoiceState) => {
        if (current === 'listening') {
          playChuff();
          return 'idle';
        }
        return current;
      });
    };

    // Delay recognition start by ~700ms after the whistle begins so the mic doesn't transcribe the whistle
    whistleTimeoutRef.current = setTimeout(() => {
      try {
        recognition.start();
      } catch (err) {
        console.warn('[useVoiceConductor] Recognition start failed:', err);
        setVoiceState('idle');
      }
    }, 700);
  }, [
    isSpeechSupported,
    onSendMessage,
    onInterimSpeech,
    setVoiceState,
    setVoiceError,
    setAriaLiveText
  ]);

  const handleSpeakingTubeClick = useCallback(() => {
    if (voiceState === 'listening') {
      stopListening();
    } else if (voiceState === 'speaking') {
      silenceSpeech();
    } else if (voiceState === 'idle') {
      startListening();
    }
  }, [voiceState, startListening, stopListening, silenceSpeech]);

  const speakReply = useCallback(
    (replyText: string, forceSpeak?: boolean) => {
      // All voice sounds strictly respect the global sound toggle (off by default)
      if (!soundEnabled) {
        setVoiceState('idle');
        return;
      }

      const shouldSpeak = forceSpeak || lastWasVoiceRef.current || readAloud;
      lastWasVoiceRef.current = false;

      if (!shouldSpeak || !replyText.trim()) {
        setVoiceState('idle');
        return;
      }

      setVoiceState('speaking');
      setAriaLiveText('Stationmaster Abernathy is speaking his response.');

      speakAbernathyReply(replyText, {
        onStart: () => setVoiceState('speaking'),
        onEnd: () => {
          setVoiceState('idle');
          setAriaLiveText('Stationmaster Abernathy has finished speaking.');
        },
        onError: () => setVoiceState('idle')
      });
    },
    [soundEnabled, readAloud, setVoiceState, setAriaLiveText]
  );

  return {
    voiceState,
    isSpeechSupported,
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    isMuted,
    toggleMute,
    readAloud,
    setReadAloud,
    voiceError,
    clearVoiceError: () => setVoiceError(null),
    ariaLiveText,
    startListening,
    stopListening,
    silenceSpeech,
    handleSpeakingTubeClick,
    speakReply
  };
}
