class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private isMuted: boolean = false;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  public speak(text: string, lang: 'de' | 'en' = 'de') {
    if (this.isMuted || !this.synth || !text) return;

    // Prevent duplicate speech within 5 seconds
    const now = Date.now();
    if (this.lastSpokenText === text && now - this.lastSpokenTime < 5000) {
      return;
    }

    this.synth.cancel(); // Stop any pending utterance

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'de' ? 'de-DE' : 'en-US';
    utterance.rate = 1.05; // Slightly brisk for navigation
    utterance.pitch = 1.0;

    // Try finding a suitable German/English voice
    const voices = this.synth.getVoices();
    const targetLang = lang === 'de' ? 'de' : 'en';
    const voice = voices.find(v => v.lang.startsWith(targetLang));
    if (voice) {
      utterance.voice = voice;
    }

    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    this.synth.speak(utterance);
  }

  public cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new SpeechService();
