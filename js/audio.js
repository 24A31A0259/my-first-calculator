/**
 * Glossy Glow Calculator - Audio & Haptic Sound Synthesizer Engine
 * Powered by Web Audio API for zero-latency acoustic feedback
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Play dynamic sound frequencies based on key type
   * @param {'digit' | 'operator' | 'action' | 'equals' | 'sci'} type 
   */
  playKeySound(type = 'digit') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    switch (type) {
      case 'digit':
        this.playTone(420, 180, 0.04, 'sine', 0.08);
        break;

      case 'operator':
        this.playTone(620, 320, 0.06, 'triangle', 0.12);
        break;

      case 'sci':
        this.playTone(760, 460, 0.05, 'square', 0.1);
        break;

      case 'action':
        this.playTone(280, 120, 0.08, 'sawtooth', 0.16);
        break;

      case 'equals':
        this.playChord([523.25, 659.25, 783.99], 0.18);
        break;
    }
  }

  playDigitSound(digit) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const pitches = {
      '0': [260, 180, 0.04, 'sine', 0.06],
      '1': [300, 220, 0.04, 'sine', 0.07],
      '2': [340, 260, 0.04, 'triangle', 0.07],
      '3': [380, 300, 0.04, 'triangle', 0.08],
      '4': [430, 340, 0.04, 'square', 0.08],
      '5': [480, 380, 0.04, 'square', 0.09],
      '6': [530, 420, 0.04, 'sawtooth', 0.09],
      '7': [590, 470, 0.04, 'sawtooth', 0.095],
      '8': [650, 520, 0.04, 'sine', 0.1],
      '9': [720, 560, 0.04, 'triangle', 0.1]
    };

    const config = pitches[digit] || pitches['0'];
    this.playTone(...config);
  }

  playTone(startFreq, endFreq, duration, wave, gainLevel) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    const now = this.ctx.currentTime;
    osc.type = wave;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gain.gain.setValueAtTime(gainLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  playChord(frequencies, duration = 0.2) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      
      gain.gain.setValueAtTime(0.08, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + duration);
    });
  }
}

// Global instance export
window.audioEngine = new AudioEngine();
