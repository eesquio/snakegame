// Procedural Web Audio API sound engine for Snake 360°

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private boostOsc: OscillatorNode | null = null;
  private boostGain: GainNode | null = null;

  constructor() {
    // Sound engine is initialized on first user gesture to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val && this.boostGain && this.ctx) {
      this.boostGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Chime sound when collecting an orb. Pitch scales with combo!
  public playEat(comboMultiplier: number = 1, rarity: 'common' | 'uncommon' | 'rare' | 'epic' = 'common') {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = rarity === 'epic' ? 880 : rarity === 'rare' ? 659.25 : rarity === 'uncommon' ? 523.25 : 440;
      // Pitch goes up with combo (up to +12 semitones)
      const pitchMultiplier = Math.pow(2, Math.min(comboMultiplier - 1, 10) * 0.1);
      const freq = baseFreq * pitchMultiplier;

      // Primary crystal bell oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = rarity === 'epic' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);

      // Add a sparkly overtone for rare/epic gems
      if (rarity === 'rare' || rarity === 'epic') {
        const overtone = this.ctx.createOscillator();
        const overtoneGain = this.ctx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.5, now);
        overtoneGain.gain.setValueAtTime(0.12, now);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        overtone.connect(overtoneGain);
        overtoneGain.connect(this.ctx.destination);
        overtone.start(now);
        overtone.stop(now + 0.36);
      }
    } catch {
      // Audio fallback silent handling
    }
  }

  // Crash / Game Over sound
  public playDie() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Heavy low frequency impact drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.45);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);

      // Noise burst for crunch
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.25);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
    } catch {
      // Silent error
    }
  }

  // Start game uplifting chord
  public playStart() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [261.63, 329.63, 392.0, 523.25]; // C, E, G, C
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch {
      // Silent error
    }
  }

  // Start continuous boost sound
  public setBoosting(boosting: boolean) {
    if (!this.enabled || !boosting) {
      if (this.boostGain && this.ctx) {
        try {
          this.boostGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
        } catch {}
      }
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      if (!this.boostOsc || !this.boostGain) {
        this.boostOsc = this.ctx.createOscillator();
        this.boostGain = this.ctx.createGain();

        this.boostOsc.type = 'triangle';
        this.boostOsc.frequency.setValueAtTime(140, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);

        this.boostGain.gain.setValueAtTime(0.0001, now);

        this.boostOsc.connect(filter);
        filter.connect(this.boostGain);
        this.boostGain.connect(this.ctx.destination);

        this.boostOsc.start();
      }

      this.boostGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    } catch {}
  }

  // Gentle boundary warning tick
  public playBoundaryTick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }
}

export const soundManager = new SoundEngine();
