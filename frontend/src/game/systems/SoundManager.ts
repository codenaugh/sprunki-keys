import { EventBus } from '../EventBus';
import { getSettings } from '../../services/storage';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private musicVolume: number;
  private sfxVolume: number;
  private bgmGain: GainNode | null = null;
  private bgmOsc: OscillatorNode | null = null;
  private bgmPlaying = false;
  private bgmTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const settings = getSettings();
    this.musicVolume = settings.musicVolume;
    this.sfxVolume = settings.sfxVolume;

    EventBus.on('letter-grabbed', this.onGrab, this);
    EventBus.on('letter-missed', this.onMiss, this);
    EventBus.on('wrong-key', this.onWrong, this);
    EventBus.on('level-complete', this.onLevelComplete, this);
    EventBus.on('settings-changed', this.onSettingsChanged, this);
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  startBGM() {
    if (this.bgmPlaying || this.musicVolume === 0) return;

    const ctx = this.getContext();
    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.value = this.musicVolume * 0.15;
    this.bgmGain.connect(ctx.destination);

    // Simple melodic loop using oscillators
    this.bgmPlaying = true;
    this.playBGMLoop();
  }

  private playBGMLoop() {
    if (!this.bgmPlaying || !this.bgmGain) return;

    const ctx = this.getContext();
    // Pentatonic melody notes (kid-friendly, happy feel)
    const notes = [523, 587, 659, 784, 880, 784, 659, 587]; // C5 scale approx
    const noteDuration = 0.3;
    const totalDuration = notes.length * noteDuration;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, ctx.currentTime + i * noteDuration);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * noteDuration + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + (i + 1) * noteDuration);

      osc.connect(gain);
      gain.connect(this.bgmGain!);

      osc.start(ctx.currentTime + i * noteDuration);
      osc.stop(ctx.currentTime + (i + 1) * noteDuration);
    });

    // Schedule next loop
    this.bgmTimeout = setTimeout(() => this.playBGMLoop(), totalDuration * 1000);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimeout) {
      clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
    if (this.bgmOsc) {
      this.bgmOsc.stop();
      this.bgmOsc = null;
    }
  }

  private onGrab() {
    this.playChime();
  }

  private onMiss() {
    this.playWhoosh();
  }

  private onWrong() {
    this.playBonk();
  }

  private onLevelComplete() {
    this.stopBGM();
    this.playFanfare();
  }

  private onSettingsChanged(settings: { musicVolume: number; sfxVolume: number }) {
    this.musicVolume = settings.musicVolume;
    this.sfxVolume = settings.sfxVolume;
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.musicVolume * 0.15;
    }
  }

  // Musical chime - ascending pitch based on combo
  private playChime() {
    if (this.sfxVolume === 0) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Vary pitch slightly based on time for musicality
    const baseFreq = 660 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = baseFreq * 2;
    gain2.gain.setValueAtTime(this.sfxVolume * 0.1, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.2);
  }

  // Whoosh sound for missed letters
  private playWhoosh() {
    if (this.sfxVolume === 0) return;
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.2);
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  // Bonk sound for wrong key
  private playBonk() {
    if (this.sfxVolume === 0) return;
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  // Fanfare for level complete
  private playFanfare() {
    if (this.sfxVolume === 0) return;
    const ctx = this.getContext();
    const notes = [523, 659, 784, 1047]; // C E G C

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.25, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  destroy() {
    this.stopBGM();
    EventBus.off('letter-grabbed', this.onGrab, this);
    EventBus.off('letter-missed', this.onMiss, this);
    EventBus.off('wrong-key', this.onWrong, this);
    EventBus.off('level-complete', this.onLevelComplete, this);
    EventBus.off('settings-changed', this.onSettingsChanged, this);
    if (this.ctx) {
      this.ctx.close();
    }
  }
}
