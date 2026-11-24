/**
 * AudioEngine for HarmonyOS NEXT Simulator
 * Simulated system sounds, notification tones, and haptic-audio sync
 * for the phone & tablet experience.
 */

class AudioEngine {
  constructor() {
    this.context = null;
    this.sounds = new Map();
    this.volume = 0.7;
    this.muted = false;
    this.presets = this.loadPresets();
  }

  async init() {
    if (typeof AudioContext !== 'undefined') {
      this.context = new AudioContext();
    }
  }

  loadPresets() {
    return {
      notification: { freq: 880, duration: 0.15, type: 'sine' },
      alert: { freq: 440, duration: 0.3, type: 'square' },
      success: { freq: 660, duration: 0.2, type: 'sine' },
      error: { freq: 220, duration: 0.4, type: 'sawtooth' },
      unlock: { freq: 523, duration: 0.1, type: 'triangle' }
    };
  }

  playTone(freq = 440, duration = 0.2, type = 'sine', volume = this.volume) {
    if (this.muted || !this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  playPreset(name) {
    const p = this.presets[name];
    if (p) this.playTone(p.freq, p.duration, p.type);
  }

  playNotification() { this.playPreset('notification'); }
  playAlert() { this.playPreset('alert'); }
  playSuccess() { this.playPreset('success'); }
  playError() { this.playPreset('error'); }
  playUnlock() { this.playPreset('unlock'); }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  mute(m = true) {
    this.muted = m;
  }

  generateSequence(notes, interval = 0.15) {
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n.freq, n.dur || 0.1, n.type || 'sine'), i * interval * 1000);
    });
  }

  // Extended audio simulation
  createAmbientLoop(baseFreq = 200, variation = 20) {
    if (!this.context) return null;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.frequency.value = baseFreq;
    gain.gain.value = 0.1 * this.volume;
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start();
    return { osc, gain, stop: () => osc.stop() };
  }

  simulateHapticFeedback(intensity = 0.5) {
    // Visual/audio proxy for haptic
    this.playTone(80, 0.05, 'square', intensity * 0.3);
  }

  getStatus() {
    return {
      initialized: !!this.context,
      volume: this.volume,
      muted: this.muted,
      presets: Object.keys(this.presets)
    };
  }

  dispose() {
    if (this.context) this.context.close();
    this.sounds.clear();
  }
}

export default AudioEngine;
export function createAudioEngine() { return new AudioEngine(); }
