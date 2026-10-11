/**
 * Delivery Partner Real-time Ringtone & Order Alert Synthesizer
 * Plays high-attention notification bells, incoming order rings, and triumphant order acceptance chimes.
 * Uses Web Audio API with rich harmonics and metallic bell overtones.
 * Runs reliably across Chrome, Edge, Android Chrome, and Safari without external MP3 dependencies.
 */

class OrderAlertRingtone {
  private audioCtx: AudioContext | null = null;
  private isRinging: boolean = false;
  private ringInterval: any = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Attempt lazy init
    this.soundEnabled = localStorage.getItem('quickpal_partner_sound') !== 'disabled';
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Unlock AudioContext on user interaction
   */
  public unlockAudio() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  public isSoundActive(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(enable?: boolean): boolean {
    this.soundEnabled = enable !== undefined ? enable : !this.soundEnabled;
    localStorage.setItem('quickpal_partner_sound', this.soundEnabled ? 'enabled' : 'disabled');
    if (!this.soundEnabled) {
      this.stopRingtone();
    }
    return this.soundEnabled;
  }

  /**
   * Authentic Metallic Notification Bell Sound
   * Synthesizes a bright, resonant brass order bell with realistic acoustic harmonics.
   */
  public playNotificationBell() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Bell Strike 1: Primary fundamental and bell harmonics
      this.synthesizeBellStrike(ctx, 987.77, now, 0.7, 0.45); // B5 (Bright bell)
      this.synthesizeBellStrike(ctx, 1318.51, now + 0.18, 0.85, 0.5); // E6 (Resonant overtone)

      // Mobile vibration pattern if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 80, 200]);
      }
    } catch (e) {
      console.warn('Notification bell audio playback error:', e);
    }
  }

  /**
   * Incoming Order Ringing Sound (Phone Call / Dispatch Alert style)
   * High-attention multi-tone siren & bell sequence designed to cut through ambient noise.
   */
  public playSingleChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Twin-ring pair (like phone ringing: Ring-Ring ... Ring-Ring)
      // First burst:
      this.createBeep(ctx, 880, now, 0.12, 0.45); // A5
      this.createBeep(ctx, 1174.66, now + 0.10, 0.15, 0.5); // D6
      this.createBeep(ctx, 1396.91, now + 0.22, 0.18, 0.55); // F6
      this.createBeep(ctx, 1760, now + 0.36, 0.25, 0.6); // A6

      // Second burst (Ringing accent chime):
      this.createBeep(ctx, 1174.66, now + 0.65, 0.12, 0.45); // D6
      this.createBeep(ctx, 1396.91, now + 0.77, 0.15, 0.5); // F6
      this.createBeep(ctx, 1760, now + 0.90, 0.18, 0.55); // A6
      this.createBeep(ctx, 2093, now + 1.05, 0.4, 0.6); // C7 High resolution ring

      // High-attention dual vibration burst
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([250, 100, 250, 100, 400]);
      }
    } catch (e) {
      console.warn('Audio ringtone chime playback note:', e);
    }
  }

  /**
   * Distinct "Order Accepted" Triumphant Ring & Confirmation Chime
   * Plays when the partner taps "Accept Order" - ascending victory fanfare with a bright finish ring.
   */
  public playOrderAcceptedSound() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Ascending triumphant major arpeggio (C5 -> E5 -> G5 -> C6 -> E6 bell ring)
      this.createBeep(ctx, 523.25, now, 0.12, 0.4, 'triangle'); // C5
      this.createBeep(ctx, 659.25, now + 0.10, 0.12, 0.45, 'triangle'); // E5
      this.createBeep(ctx, 783.99, now + 0.20, 0.15, 0.5, 'triangle'); // G5
      this.createBeep(ctx, 1046.50, now + 0.32, 0.20, 0.55, 'sine'); // C6
      
      // Final sparkling success bell ring
      this.synthesizeBellStrike(ctx, 1567.98, now + 0.45, 0.9, 0.6); // G6 Bell resonance
      this.synthesizeBellStrike(ctx, 2093.00, now + 0.55, 1.1, 0.5); // C7 Crystal ring

      // Positive single long haptic buzz
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([150, 50, 300]);
      }
    } catch (e) {
      console.warn('Order accepted sound playback error:', e);
    }
  }

  /**
   * Helper to synthesize realistic bell overtones with harmonic decay
   */
  private synthesizeBellStrike(
    ctx: AudioContext,
    fundamental: number,
    startTime: number,
    duration: number,
    volume: number = 0.5
  ) {
    // 3 harmonic partials to emulate real metal bell strike (fundamental, minor third overtone, octave)
    const partials = [
      { ratio: 1.0, gain: 1.0, decay: duration },
      { ratio: 1.5, gain: 0.5, decay: duration * 0.7 },
      { ratio: 2.0, gain: 0.3, decay: duration * 0.5 },
      { ratio: 2.76, gain: 0.15, decay: duration * 0.35 }
    ];

    partials.forEach(p => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * p.ratio, startTime);

      // Rapid attack, natural bell exponential decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(volume * p.gain, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + p.decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + p.decay + 0.05);
    });
  }

  private createBeep(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    volume: number = 0.3,
    waveform: OscillatorType = 'triangle'
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /**
   * Continuous Ringtone for Incoming New Orders until accepted/acknowledged
   */
  public startContinuousRingtone() {
    if (!this.soundEnabled || this.isRinging) return;
    this.isRinging = true;

    // Play immediately with incoming bell and ringing sequence
    this.playSingleChime();

    // Repeat every 2.6 seconds
    this.ringInterval = setInterval(() => {
      if (this.isRinging && this.soundEnabled) {
        this.playSingleChime();
      }
    }, 2600);
  }

  public stopRingtone() {
    this.isRinging = false;
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  public isCurrentlyRinging(): boolean {
    return this.isRinging;
  }
}

export const orderAlertSound = new OrderAlertRingtone();
