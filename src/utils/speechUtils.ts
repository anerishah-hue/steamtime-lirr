/**
 * Victorian Speech Synthesis utilities for Stationmaster Abernathy.
 */
import { isSoundEnabled } from './audioWhistle';

/**
 * Primes SpeechSynthesis on iOS / Safari during a direct user touch/click.
 * Must be invoked inside the button's click handler.
 */
export function primeSpeechSynthesis(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.debug('Failed to prime speech synthesis:', e);
  }
}

/**
 * Strips URLs, markdown syntax, bullet characters, and emojis so speech flows naturally.
 */
export function stripMarkdownAndEmoji(raw: string): string {
  if (!raw) return '';

  let clean = raw;

  // 1. Markdown links: [anchor text](url) -> anchor text (run before stripping raw URLs)
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 2. Strip any remaining standalone URLs
  clean = clean.replace(/https?:\/\/\S+/gi, '');

  // 3. Markdown bold/italics: **text**, *text*, _text_
  clean = clean.replace(/(\*\*|__)(.*?)\1/g, '$2');
  clean = clean.replace(/(\*|_)(.*?)\1/g, '$2');

  // 4. Code backticks
  clean = clean.replace(/`([^`]+)`/g, '$1');

  // 5. Headers & bullet points at start of lines
  clean = clean.replace(/^#{1,6}\s+/gm, '');
  clean = clean.replace(/^[•\-\*]\s+/gm, '');

  // 6. Common emojis & symbols
  clean = clean.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '');

  // 7. Strip leftover brackets, asterisks, tildes
  clean = clean.replace(/[\*~#]/g, '');

  // 8. Normalize spaces and multiple newlines
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}

/**
 * Splits text into natural sentence boundaries to prevent speech synthesis cutoffs in Chrome.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];

  // Match sentences ending in punctuation
  const rawSentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
  return rawSentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {}
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Selects an authentic British (en-GB) voice if available, falling back to any English voice.
 */
export function getBestVictorianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices().length > 0
    ? window.speechSynthesis.getVoices()
    : cachedVoices;

  if (!voices || voices.length === 0) return null;

  // 1. Try en-GB male or British named voice
  const preferredBritish = voices.find((v) => {
    const lang = (v.lang || '').replace('_', '-').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return (
      lang.startsWith('en-gb') &&
      (name.includes('male') || name.includes('daniel') || name.includes('george') || name.includes('oliver') || name.includes('uk english'))
    );
  });
  if (preferredBritish) return preferredBritish;

  // 2. Any en-GB voice
  const anyBritish = voices.find((v) => (v.lang || '').replace('_', '-').toLowerCase().startsWith('en-gb'));
  if (anyBritish) return anyBritish;

  // 3. Any English voice
  const anyEnglish = voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // 4. Fallback to default system voice
  return voices[0] || null;
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let activePlaybackId = 0;

/**
 * Cancels any active speech synthesis immediately.
 */
export function cancelSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  activePlaybackId++;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    console.debug('Speech cancel error:', e);
  }
}

/**
 * Speaks text sentence-by-sentence in Abernathy's Victorian cadence.
 */
export function speakAbernathyReply(fullText: string, options?: SpeakOptions): void {
  // Global sound toggle must be enabled for voice speech to be heard
  if (!isSoundEnabled() || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return;
  }

  // Cancel any existing speech first
  cancelSpeech();
  const currentPlaybackId = ++activePlaybackId;

  const cleaned = stripMarkdownAndEmoji(fullText);
  if (!cleaned) {
    options?.onEnd?.();
    return;
  }

  const sentences = splitIntoSentences(cleaned);
  if (sentences.length === 0) {
    options?.onEnd?.();
    return;
  }

  const voice = getBestVictorianVoice();
  let currentIndex = 0;

  options?.onStart?.();

  const speakNextSentence = () => {
    // If playback was cancelled or superseded by a new message, abort
    if (currentPlaybackId !== activePlaybackId) return;

    if (currentIndex >= sentences.length) {
      options?.onEnd?.();
      return;
    }

    const sentence = sentences[currentIndex++];
    const utterance = new SpeechSynthesisUtterance(sentence);

    if (voice) utterance.voice = voice;
    utterance.rate = 0.95; // Slightly deliberate Victorian gentleman cadence
    utterance.pitch = 0.9; // Rich, warm, slightly lower resonant tone
    utterance.lang = voice?.lang || 'en-GB';

    utterance.onend = () => {
      if (currentPlaybackId === activePlaybackId) {
        speakNextSentence();
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (currentPlaybackId === activePlaybackId) {
        options?.onError?.(e);
        options?.onEnd?.();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  speakNextSentence();
}
