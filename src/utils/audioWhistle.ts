/**
 * Web Audio API synthesizer for Victorian steam locomotive sound effects.
 * 100% synthesized in the browser — no audio files or network requests required.
 */

const SOUND_STORAGE_KEY = 'brassline_sound_enabled';
const LEGACY_MUTE_KEY = 'brassline_audio_muted';

let sharedAudioCtx: AudioContext | null = null;

/**
 * Creates or resumes the AudioContext inside a user gesture handler (iOS Safari requirement).
 */
export function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (e) {
    console.debug('[Audio] Could not create AudioContext:', e);
    return null;
  }
}

/**
 * Checks whether global audio effects & voice speech are enabled.
 * Off by default, saved in localStorage with try/catch.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Updates the global sound state in localStorage with try/catch.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
    localStorage.setItem(LEGACY_MUTE_KEY, enabled ? 'false' : 'true');
  } catch {}
}

/**
 * Checks whether audio effects are currently muted (inversion of isSoundEnabled).
 */
export function isSoundMuted(): boolean {
  return !isSoundEnabled();
}

/**
 * Updates the sound mute state in localStorage.
 */
export function setSoundMuted(muted: boolean): void {
  setSoundEnabled(!muted);
}

/**
 * Synthesizes an authentic Victorian steam train whistle when listening starts:
 * - 3 detuned sine/triangle oscillators around 700-1100 Hz (G5 784Hz, A5 880Hz, C6 1046Hz)
 * - Quick attack (~35ms)
 * - Slight 6Hz vibrato via LFO
 * - ~0.6s decay
 * - Filtered-noise steam hiss
 * - Master gain around 0.15
 */
export function playWhistle(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.65; // ~0.6s decay + attack

    // Master Volume Envelope (Peak Gain ~0.15, quick attack ~35ms, decay to 0)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.15, now + 0.035);
    masterGain.gain.setValueAtTime(0.15, now + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    // 1. Vibrato LFO (6.5 Hz modulation, depth ~12 Hz)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(6.5, now);
    lfoGain.gain.setValueAtTime(12, now);
    lfo.connect(lfoGain);

    // 2. Three detuned harmonic oscillators (700 - 1100 Hz range)
    // Osc 1: 784 Hz (G5) Triangle
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(784, now);
    lfoGain.connect(osc1.frequency);

    // Osc 2: 880 Hz (A5) Sine, slightly sharp (+14 cents)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    osc2.detune.setValueAtTime(14, now);
    lfoGain.connect(osc2.frequency);

    // Osc 3: 1046 Hz (C6) Triangle, slightly flat (-8 cents)
    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1046, now);
    osc3.detune.setValueAtTime(-8, now);
    lfoGain.connect(osc3.frequency);

    // Whistle Bandpass Filter (warm resonant body)
    const whistleFilter = ctx.createBiquadFilter();
    whistleFilter.type = 'bandpass';
    whistleFilter.frequency.setValueAtTime(950, now);
    whistleFilter.Q.setValueAtTime(2.2, now);

    osc1.connect(whistleFilter);
    osc2.connect(whistleFilter);
    osc3.connect(whistleFilter);
    whistleFilter.connect(masterGain);

    // 3. Filtered-Noise Steam Hiss
    const noiseLength = Math.floor(ctx.sampleRate * 0.55);
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2200, now);
    noiseFilter.Q.setValueAtTime(2.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.045, now + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    // Start all sound generators
    lfo.start(now);
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    noiseSource.start(now);

    // Stop at end of duration
    lfo.stop(now + duration);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
    noiseSource.stop(now + duration);
  } catch (err) {
    console.debug('[Audio] playWhistle error:', err);
  }
}

/**
 * Synthesizes a soft steam "chuff" when speech recognition stops:
 * Short low-frequency puff of steam exhaust from the locomotive cylinders.
 */
export function playChuff(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.22; // ~220ms soft chuff

    // Master Chuff Gain (Peak ~0.08)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    masterGain.connect(ctx.destination);

    // 1. Low piston pulse (sine/triangle sweep 95Hz -> 45Hz)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + duration);

    // 2. White noise steam release
    const noiseLength = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Low-pass filter sweeping down to muffle steam release
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + duration);

    osc.connect(masterGain);
    noiseSource.connect(filter);
    filter.connect(masterGain);

    osc.start(now);
    noiseSource.start(now);

    osc.stop(now + duration);
    noiseSource.stop(now + duration);
  } catch (err) {
    console.debug('[Audio] playChuff error:', err);
  }
}

/**
 * Master volume constant for the train "choo-choo" audio file and synthesized fallback.
 * Single constant configurable here as requested (0.0 to 1.0).
 */
export const TRAIN_AUDIO_VOLUME = 0.6;

const CHOO_CHOO_AUDIO_URL = '/choochoo.mp3';

let trainAudioElement: HTMLAudioElement | null = null;
let trainAudioLoadFailed = false;

/**
 * Initializes and preloads the locomotive audio element from /choochoo.mp3
 * using the HTML Audio API so it plays instantly upon user interaction.
 */
export function preloadTrainAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
  if (!trainAudioElement) {
    try {
      trainAudioElement = new Audio(CHOO_CHOO_AUDIO_URL);
      trainAudioElement.preload = 'auto';
      trainAudioElement.volume = TRAIN_AUDIO_VOLUME;
      trainAudioElement.addEventListener('error', () => {
        trainAudioLoadFailed = true;
      });
      // Trigger preloading immediately
      trainAudioElement.load();
    } catch {
      trainAudioLoadFailed = true;
      return null;
    }
  }
  return trainAudioElement;
}

// Preload on client module evaluation so it is cached and ready to play instantly
if (typeof window !== 'undefined') {
  preloadTrainAudio();
}

let activeChooChooMasterGain: GainNode | null = null;
let activeChooChooSources: Array<{ stop: (time: number) => void }> = [];

export interface PlayChooChooOptions {
  withWhistle?: boolean;
}

/**
 * Stops any actively running synthesized choo-choo sound to prevent overlaps.
 */
function stopSynthesizedChooChoo(): void {
  if (activeChooChooMasterGain) {
    try {
      const ctx = sharedAudioCtx;
      const now = ctx ? ctx.currentTime : 0;
      activeChooChooMasterGain.gain.cancelScheduledValues(now);
      activeChooChooMasterGain.gain.setValueAtTime(0, now);
      activeChooChooMasterGain.disconnect();
    } catch {}
    activeChooChooMasterGain = null;
  }
  for (const src of activeChooChooSources) {
    try {
      src.stop(0);
    } catch {}
  }
  activeChooChooSources = [];
}

/**
 * Fallback synthesizer for authentic "choo... choo..." steam-train sound via Web Audio API.
 * Used if the /choochoo.mp3 audio file fails to load or play.
 *
 * Each "choo" is a short burst of steam:
 * - White noise through a bandpass filter sweeping from ~400 Hz to ~1800 Hz over ~120ms
 * - Amplitude envelope: very fast attack (~10ms), decay ~250ms
 * - Low "thump" underneath (sine 70-90 Hz, ~100ms decay)
 * - Gain scaled by TRAIN_AUDIO_VOLUME
 * - Two choos ~350ms apart, second slightly softer
 * - Optional soft whistle tail after second choo when withWhistle is true
 */
export function playSynthesizedChooChoo(options?: PlayChooChooOptions): void {
  if (!isSoundEnabled()) return;

  const withWhistle = Boolean(options?.withWhistle);

  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Stop previous sound immediately if user clicks again while playing
    stopSynthesizedChooChoo();

    // Pause audio element if it was playing
    if (trainAudioElement && !trainAudioElement.paused) {
      try {
        trainAudioElement.pause();
        trainAudioElement.currentTime = 0;
      } catch {}
    }

    // Volume scaling based on TRAIN_AUDIO_VOLUME constant (relative to baseline 0.6)
    const volumeScale = Math.max(0.1, Math.min(1.0, TRAIN_AUDIO_VOLUME / 0.6));

    // Master gain node for this specific choo-choo playback
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volumeScale, now);
    masterGain.connect(ctx.destination);
    activeChooChooMasterGain = masterGain;

    // +/-5% random variation in pitch and timing
    const randomVariation = () => 1 + (Math.random() * 0.1 - 0.05);
    const pitchVar1 = randomVariation();
    const pitchVar2 = randomVariation();
    const timingVar = randomVariation();

    // Helper to generate white noise buffer
    const createNoiseBuffer = (durationSec: number) => {
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    };

    /**
     * Synthesizes one "choo" burst of steam at startTime:
     * - White noise through bandpass sweeping 400Hz -> 1800Hz over ~120ms
     * - Fast attack (~10ms), decay (~250ms)
     * - Low thump underneath (70-90Hz sine, ~100ms decay)
     */
    const renderChoo = (startTime: number, gainLevel: number, pitchFactor: number) => {
      const chooDuration = 0.28;

      // 1. White noise steam burst
      const noiseBuffer = createNoiseBuffer(chooDuration);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Bandpass filter sweeping ~400Hz up to ~1800Hz over ~120ms ("ch" to "oo" feel)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      const startFreq = Math.max(100, 400 * pitchFactor);
      const endFreq = Math.min(ctx.sampleRate / 2, 1800 * pitchFactor);
      bandpass.frequency.setValueAtTime(startFreq, startTime);
      bandpass.frequency.exponentialRampToValueAtTime(endFreq, startTime + 0.120);
      bandpass.Q.setValueAtTime(2.2, startTime);

      // Amplitude envelope: very fast attack (~10ms), decay of ~250ms
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, startTime);
      noiseGain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.010);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.260);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(masterGain);

      // 2. Low "thump" underneath (sine around 70-90 Hz, ~100ms decay)
      const thumpOsc = ctx.createOscillator();
      thumpOsc.type = 'sine';
      const thumpFreq = 80 * pitchFactor;
      thumpOsc.frequency.setValueAtTime(thumpFreq, startTime);
      thumpOsc.frequency.exponentialRampToValueAtTime(thumpFreq * 0.7, startTime + 0.100);

      const thumpGain = ctx.createGain();
      const thumpLevel = gainLevel * 0.45;
      thumpGain.gain.setValueAtTime(0.0001, startTime);
      thumpGain.gain.linearRampToValueAtTime(thumpLevel, startTime + 0.006);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.100);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(masterGain);

      noiseSource.start(startTime);
      thumpOsc.start(startTime);
      noiseSource.stop(startTime + chooDuration);
      thumpOsc.stop(startTime + 0.110);

      activeChooChooSources.push(noiseSource, thumpOsc);
    };

    // First "choo": gain ~0.2 overall
    const t0 = now + 0.01;
    renderChoo(t0, 0.20, pitchVar1);

    // Second "choo": ~350ms apart (with +/-5% timing variation), slightly softer (~0.14)
    const chooInterval = 0.350 * timingVar;
    const t1 = t0 + chooInterval;
    renderChoo(t1, 0.14, pitchVar2);

    let totalDuration = chooInterval + 0.30;

    // Optional short, soft whistle tail after the second choo (for logo click only)
    if (withWhistle) {
      const whistleStart = t1 + 0.22;
      const whistleDuration = 0.38;
      totalDuration = (whistleStart - now) + whistleDuration;

      // Soft dual-tone whistle (784Hz & 1046Hz, softer peak gain ~0.055)
      const wOsc1 = ctx.createOscillator();
      wOsc1.type = 'triangle';
      wOsc1.frequency.setValueAtTime(784 * pitchVar1, whistleStart);

      const wOsc2 = ctx.createOscillator();
      wOsc2.type = 'sine';
      wOsc2.frequency.setValueAtTime(1046 * pitchVar2, whistleStart);

      const wFilter = ctx.createBiquadFilter();
      wFilter.type = 'bandpass';
      wFilter.frequency.setValueAtTime(920 * pitchVar1, whistleStart);
      wFilter.Q.setValueAtTime(2.4, whistleStart);

      const wGain = ctx.createGain();
      wGain.gain.setValueAtTime(0.0001, whistleStart);
      wGain.gain.linearRampToValueAtTime(0.055, whistleStart + 0.025);
      wGain.gain.exponentialRampToValueAtTime(0.0001, whistleStart + whistleDuration);

      wOsc1.connect(wFilter);
      wOsc2.connect(wFilter);
      wFilter.connect(wGain);
      wGain.connect(masterGain);

      wOsc1.start(whistleStart);
      wOsc2.start(whistleStart);
      wOsc1.stop(whistleStart + whistleDuration);
      wOsc2.stop(whistleStart + whistleDuration);

      activeChooChooSources.push(wOsc1, wOsc2);
    }

    // Clean up reference when sequence finishes
    setTimeout(() => {
      if (activeChooChooMasterGain === masterGain) {
        activeChooChooMasterGain = null;
        activeChooChooSources = [];
      }
    }, Math.ceil((totalDuration + 0.1) * 1000));
  } catch (err) {
    console.debug('[Audio] playSynthesizedChooChoo error:', err);
  }
}

/**
 * Plays the steam-train sound for both the logo click and the "ALL ABOARD" button:
 * - Loads / plays the audio file at /choochoo.mp3 via the Audio API (preloaded for instant playback).
 * - Invoked inside the click handler to follow iOS/Safari autoplay rules.
 * - Respects the existing global sound toggle (isSoundEnabled() - off by default).
 * - If the user clicks again while playing, restarts it from the beginning instead of overlapping.
 * - Volume is governed by TRAIN_AUDIO_VOLUME (~0.6 single constant).
 * - If the audio file fails to load, falls back silently to the existing synthesized sound.
 * - Voice chat mic sounds (playWhistle / playChuff) remain unaffected.
 */
export function playChooChoo(options?: PlayChooChooOptions): void {
  if (!isSoundEnabled()) return;

  // Stop any active synthesized sound to avoid overlapping
  stopSynthesizedChooChoo();

  const audio = preloadTrainAudio();

  if (audio && !trainAudioLoadFailed && !audio.error) {
    try {
      audio.volume = TRAIN_AUDIO_VOLUME;

      // Restart from the beginning if user clicks again while playing
      try {
        if (audio.readyState > 0 || audio.currentTime !== 0) {
          audio.currentTime = 0;
        }
      } catch {}

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If interrupted by another click / play invocation, ignore AbortError
          if (err && (err.name === 'AbortError' || err.code === 20)) {
            return;
          }
          console.debug('[Audio] /choochoo.mp3 play failed, falling back silently to synthesized sound:', err);
          playSynthesizedChooChoo(options);
        });
      }
      return;
    } catch (err) {
      console.debug('[Audio] /choochoo.mp3 exception, falling back silently to synthesized sound:', err);
      playSynthesizedChooChoo(options);
      return;
    }
  }

  // Fall back silently to the existing synthesized sound if audio file is unavailable
  playSynthesizedChooChoo(options);
}

// Backward compatibility alias
export const playSteamWhistle = playWhistle;
