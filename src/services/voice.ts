/**
 * Voice Service: Handles browser-native Speech Synthesis (TTS) and Speech Recognition (STT).
 * Zero external voice API keys required.
 * No Gemini Live API used.
 * Robust permission status handling (granted, prompt, denied).
 */

export type MicPermissionState = 'granted' | 'prompt' | 'denied' | 'unsupported';

type VoiceStateCallback = (speaking: boolean, currentText: string) => void;

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: VoiceStateCallback[] = [];
  public isSpeaking: boolean = false;
  public currentSpokenText: string = '';
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public subscribe(cb: VoiceStateCallback) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isSpeaking, this.currentSpokenText));
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  /**
   * Speak text in either Tamil (ta-IN) or English (en-IN).
   * Prefers a female-sounding voice if available in the browser.
   */
  public speak(text: string, language: 'ta' | 'en' = 'ta', onEnd?: () => void) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      onEnd?.();
      return;
    }

    this.stop();

    // Clean formatting characters, markdown symbols, and emojis for smooth voice delivery
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        ''
      )
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = language === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.lang = targetLang;
    utterance.rate = language === 'ta' ? 0.93 : 0.96; // slightly relaxed pace for clarity
    utterance.pitch = 1.05; // warm, friendly tone

    const availableVoices = this.getVoices();
    let chosenVoice: SpeechSynthesisVoice | null = null;

    if (language === 'ta') {
      // Find Tamil voices
      const taVoices = availableVoices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('ta') ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.toLowerCase().includes('தமிழ்')
      );

      // Prefer female Tamil voice if browser provides one
      chosenVoice =
        taVoices.find(
          (v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('vani') ||
            v.name.toLowerCase().includes('kalpana') ||
            v.name.toLowerCase().includes('geeta') ||
            v.name.toLowerCase().includes('google தமிழ்')
        ) ||
        taVoices[0] ||
        null;
    } else {
      // Find Indian English voices first, then general English
      const enInVoices = availableVoices.filter(
        (v) =>
          v.lang.toLowerCase() === 'en-in' ||
          v.lang.toLowerCase().startsWith('en_in')
      );
      const allEnVoices = availableVoices.filter((v) =>
        v.lang.toLowerCase().startsWith('en')
      );

      // Prefer female voice
      chosenVoice =
        enInVoices.find(
          (v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('heera') ||
            v.name.toLowerCase().includes('veena') ||
            v.name.toLowerCase().includes('neerja') ||
            v.name.toLowerCase().includes('priya')
        ) ||
        enInVoices[0] ||
        allEnVoices.find(
          (v) =>
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('google')
        ) ||
        allEnVoices[0] ||
        null;
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.currentSpokenText = cleanText;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentSpokenText = '';
      this.notify();
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.currentSpokenText = '';
      this.notify();
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentSpokenText = '';
      this.notify();
    }
  }

  public replay(language: 'ta' | 'en' = 'ta') {
    if (this.currentSpokenText) {
      const txt = this.currentSpokenText;
      this.stop();
      this.speak(txt, language);
    }
  }
}

export const voiceService = new VoiceService();

/**
 * Checks if browser supports native SpeechRecognition.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Check permission status without triggering a prompt
 * Returns: 'granted' | 'prompt' | 'denied' | 'unsupported'
 */
export async function getMicrophonePermissionState(): Promise<MicPermissionState> {
  if (typeof window === 'undefined' || !navigator?.mediaDevices) {
    return 'unsupported';
  }

  if (navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });
      return status.state as MicPermissionState;
    } catch (e) {
      // Fallback if query on microphone is not supported by the browser
    }
  }

  return 'prompt';
}

/**
 * Explicitly request microphone access using getUserMedia
 * Immediately stops any opened audio tracks to release the hardware.
 */
export async function requestMicrophonePermission(): Promise<{
  granted: boolean;
  status: MicPermissionState;
  error?: string;
}> {
  if (
    typeof window === 'undefined' ||
    !navigator?.mediaDevices?.getUserMedia
  ) {
    return {
      granted: false,
      status: 'unsupported',
      error: 'Microphone API is not supported in this browser.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop tracks to free microphone for SpeechRecognition
    stream.getTracks().forEach((track) => track.stop());
    return { granted: true, status: 'granted' };
  } catch (err: any) {
    console.warn('Microphone permission request result:', err);
    if (
      err.name === 'NotAllowedError' ||
      err.name === 'PermissionDeniedError'
    ) {
      return {
        granted: false,
        status: 'denied',
        error:
          'Microphone permission was denied. Please allow microphone access in your browser.',
      };
    }
    return {
      granted: false,
      status: 'unsupported',
      error: err?.message || 'Could not access microphone.',
    };
  }
}

/**
 * Native Browser Speech Recognition Factory
 * When Tamil is selected: lang = 'ta-IN'
 * When English is selected: lang = 'en-IN'
 */
export function createSpeechRecognizer(
  language: 'ta' | 'en',
  onResult: (text: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        onResult(final, true);
      } else if (interim) {
        onResult(interim, false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      onError(event.error);
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  } catch (err: any) {
    console.warn('Could not initialize SpeechRecognition:', err);
    return null;
  }
}
