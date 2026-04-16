// Procedural chiptune music engine using the Web Audio API.
// All six tracks (title + 5 acts) are generated from simple note patterns —
// no audio files are shipped. Fits the "everything is generated" ethos
// of the rest of the codebase (sprites, sfx, particles all programmatic).
//
// Tracks are stepped by a lookahead scheduler: every 25 ms we schedule any
// notes that will fire in the next 150 ms. This keeps playback rock-solid
// even when the main thread is busy, and lets Phaser's tweens/physics run
// without competing for timing.

import { gameState } from './GameState';

type Wave = 'square' | 'sawtooth' | 'triangle' | 'sine';

interface Voice {
  pattern: string[];       // note names ("C5", "F#4", "Eb3") or '-' / '.' for rest
  wave?: Wave;             // default 'square'
  gain?: number;           // default 0.11
  octaveShift?: number;    // default 0
  noteLenFrac?: number;    // fraction of a step a note sustains (default 0.85)
  attack?: number;         // seconds
  release?: number;        // seconds
  vibrato?: number;        // Hz of LFO on frequency (0 = off)
  detune?: number;         // cents
}

interface DrumVoice {
  pattern: (0 | 1)[];
  type?: 'hat' | 'kick' | 'snare';
  gain?: number;
  decay?: number;
}

interface Track {
  bpm: number;
  stepsPerBeat: number;    // 2 = eighths, 4 = sixteenths
  lead?: Voice;
  harmony?: Voice;
  bass?: Voice;
  drums?: DrumVoice[];
  masterGain?: number;     // per-track overall gain (default 1)
}

const NOTE_OFFSETS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

function noteToFreq(note: string, octaveShift = 0): number | null {
  if (!note || note === '-' || note === '.') return null;
  const m = note.match(/^([A-G][b#]?)(-?\d)$/);
  if (!m) return null;
  const offset = NOTE_OFFSETS[m[1]];
  if (offset === undefined) return null;
  const midi = offset + (parseInt(m[2], 10) + octaveShift + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ======================================================================
// TRACK LIBRARY
// Each pattern is a flat step list. Use '-' for rests. Patterns of
// different lengths loop independently — a 16-step hat pattern over a
// 32-step lead just repeats twice per melody cycle.
// ======================================================================

/** TITLE — "Arcade Ready". C major, 140 BPM, upbeat and triumphant. */
const TITLE_THEME: Track = {
  bpm: 140, stepsPerBeat: 2,
  lead: {
    wave: 'square', gain: 0.1,
    pattern: [
      'C5','-','E5','G5', 'C6','-','G5','E5',
      'F5','-','A5','C6', 'F6','-','C6','A5',
      'G5','-','B5','D6', 'G6','E6','D6','B5',
      'C6','-','G5','E5', 'C5','-','-','-',
    ],
  },
  bass: {
    wave: 'triangle', gain: 0.16,
    pattern: [
      'C3','-','G3','-', 'C3','-','G3','-',
      'F3','-','C4','-', 'F3','-','C4','-',
      'G3','-','D4','-', 'G3','-','D4','-',
      'C3','-','G3','-', 'C3','-','C3','-',
    ],
  },
  drums: [
    { type: 'kick', pattern: [1,0,0,0, 1,0,0,0], gain: 0.28 },
    { type: 'hat', pattern: [0,1,0,1, 0,1,0,1], gain: 0.04, decay: 0.04 },
  ],
};

/** ACT 1 — "Nine to Five". C major, 128 BPM, bouncy workday rhythm. */
const ACT1_THEME: Track = {
  bpm: 128, stepsPerBeat: 2,
  lead: {
    wave: 'square', gain: 0.09,
    pattern: [
      'C5','E5','G5','E5', 'C5','E5','G5','E5',
      'D5','F5','A5','F5', 'D5','F5','A5','F5',
      'E5','G5','B5','G5', 'E5','G5','B5','G5',
      'F5','E5','D5','-',  'G5','E5','C5','-',
    ],
  },
  bass: {
    wave: 'triangle', gain: 0.15,
    pattern: [
      'C3','-','C3','-', 'G3','-','G3','-',
      'D3','-','D3','-', 'A3','-','A3','-',
      'E3','-','E3','-', 'B3','-','B3','-',
      'F3','-','C3','-', 'G3','-','C3','-',
    ],
  },
  drums: [
    { type: 'kick', pattern: [1,0,0,0, 1,0,0,0], gain: 0.25 },
    { type: 'snare', pattern: [0,0,1,0, 0,0,1,0], gain: 0.08, decay: 0.08 },
    { type: 'hat', pattern: [1,1,1,1, 1,1,1,1], gain: 0.03, decay: 0.03 },
  ],
};

/** ACT 2 — "Save the Day". G major, 134 BPM, hopeful and rising. */
const ACT2_THEME: Track = {
  bpm: 134, stepsPerBeat: 2,
  lead: {
    wave: 'square', gain: 0.09,
    pattern: [
      'G4','B4','D5','G5', 'B5','G5','D5','B4',
      'A4','C5','E5','A5', 'C6','A5','E5','C5',
      'B4','D5','G5','B5', 'D6','B5','G5','D5',
      'C5','E5','G5','D5', 'B4','G4','-','-',
    ],
  },
  harmony: {
    wave: 'triangle', gain: 0.05,
    pattern: [
      'D5','-','G5','-', 'D6','-','G5','-',
      'E5','-','A5','-', 'E6','-','A5','-',
      'D5','-','G5','-', 'F#6','-','G5','-',
      'G5','-','D5','-', 'G5','-','-','-',
    ],
  },
  bass: {
    wave: 'triangle', gain: 0.16,
    pattern: [
      'G2','-','D3','-', 'G2','-','D3','-',
      'A2','-','E3','-', 'A2','-','E3','-',
      'B2','-','F#3','-','G2','-','D3','-',
      'C3','-','G3','-', 'D3','-','G2','-',
    ],
  },
  drums: [
    { type: 'kick', pattern: [1,0,0,0, 1,0,0,0], gain: 0.22 },
    { type: 'hat', pattern: [0,1,0,1, 0,1,0,1], gain: 0.035, decay: 0.04 },
  ],
};

/** ACT 3 — "The Red". D minor, 148 BPM, tense and driving. */
const ACT3_THEME: Track = {
  bpm: 148, stepsPerBeat: 2,
  lead: {
    wave: 'sawtooth', gain: 0.075,
    pattern: [
      'D5','-','F5','A5', '-','D5','-','A4',
      'C5','-','E5','G5', '-','C5','-','G4',
      'Bb4','-','D5','F5','-','Bb4','-','F4',
      'A4','-','D5','F5', 'A5','D5','-','-',
    ],
  },
  bass: {
    wave: 'square', gain: 0.14,
    pattern: [
      'D3','D3','-','D3', 'A2','A2','-','A2',
      'C3','C3','-','C3', 'G2','G2','-','G2',
      'Bb2','Bb2','-','Bb2','F2','F2','-','F2',
      'A2','A2','-','A2', 'D3','D3','-','-',
    ],
  },
  drums: [
    { type: 'kick', pattern: [1,0,1,0, 1,0,1,0], gain: 0.26 },
    { type: 'snare', pattern: [0,0,1,0, 0,0,1,0], gain: 0.09, decay: 0.07 },
    { type: 'hat', pattern: [0,1,0,1, 0,1,1,1], gain: 0.04, decay: 0.03 },
  ],
};

/** ACT 4 — "Machine". A minor, 150 BPM, mechanical & industrial. */
const ACT4_THEME: Track = {
  bpm: 150, stepsPerBeat: 2,
  lead: {
    wave: 'square', gain: 0.08, noteLenFrac: 0.55,
    pattern: [
      'A4','A4','-','A4', 'C5','C5','-','C5',
      'G4','G4','-','G4', 'B4','B4','-','B4',
      'F4','F4','-','F4', 'A4','A4','-','A4',
      'E4','G4','A4','C5','E5','-','A4','-',
    ],
  },
  harmony: {
    wave: 'sawtooth', gain: 0.04, noteLenFrac: 0.45,
    pattern: [
      'E5','-','-','-', 'E5','-','-','-',
      'D5','-','-','-', 'D5','-','-','-',
      'C5','-','-','-', 'C5','-','-','-',
      'B4','-','-','-', 'C5','-','-','-',
    ],
  },
  bass: {
    wave: 'square', gain: 0.13,
    pattern: [
      'A2','A2','A2','-', 'A2','A2','-','A2',
      'G2','G2','G2','-', 'G2','G2','-','G2',
      'F2','F2','F2','-', 'F2','F2','-','F2',
      'E2','E2','E2','-', 'A2','A2','-','-',
    ],
  },
  drums: [
    { type: 'kick', pattern: [1,0,0,1, 0,0,1,0], gain: 0.28 },
    { type: 'snare', pattern: [0,0,1,0, 0,0,1,0], gain: 0.08, decay: 0.05 },
    { type: 'hat', pattern: [1,0,1,0, 1,0,1,0], gain: 0.035, decay: 0.025 },
  ],
};

/** ACT 5 — "The Long Game". Eb major, 120 BPM, heroic finale. */
const ACT5_THEME: Track = {
  bpm: 120, stepsPerBeat: 2,
  lead: {
    wave: 'square', gain: 0.095,
    pattern: [
      'Eb5','-','G5','-',  'Bb5','-','Eb6','-',
      'D6','-','Bb5','-',  'G5','-','Eb5','-',
      'F5','-','Ab5','-',  'C6','-','F6','-',
      'Eb6','-','Bb5','-', 'G5','Ab5','Bb5','-',
    ],
  },
  harmony: {
    wave: 'triangle', gain: 0.055,
    pattern: [
      'G5','-','Bb5','-',  'D6','-','G6','-',
      'F6','-','D6','-',   'Bb5','-','G5','-',
      'Ab5','-','C6','-',  'Eb6','-','Ab6','-',
      'G6','-','D6','-',   'Bb5','C6','D6','-',
    ],
  },
  bass: {
    wave: 'triangle', gain: 0.17,
    pattern: [
      'Eb3','-','-','-', 'Bb3','-','-','-',
      'Eb3','-','-','-', 'Bb3','-','-','-',
      'Ab3','-','-','-', 'Eb4','-','-','-',
      'Bb3','-','-','-', 'Eb3','-','-','-',
    ],
  },
  drums: [
    { type: 'kick', pattern: [1,0,0,0, 1,0,0,0], gain: 0.3 },
    { type: 'snare', pattern: [0,0,1,0, 0,0,1,0], gain: 0.09, decay: 0.09 },
    { type: 'hat', pattern: [0,1,0,1, 0,1,0,1], gain: 0.04, decay: 0.05 },
  ],
};

export const TRACKS: Record<string, Track> = {
  title: TITLE_THEME,
  act1: ACT1_THEME,
  act2: ACT2_THEME,
  act3: ACT3_THEME,
  act4: ACT4_THEME,
  act5: ACT5_THEME,
};

// ======================================================================
// ENGINE
// ======================================================================

class MusicManagerImpl {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private currentId: string | null = null;
  private track: Track | null = null;
  private step = 0;
  private nextStepTime = 0;
  private schedulerId: number | null = null;

  private readonly LOOKAHEAD_MS = 25;
  private readonly SCHEDULE_AHEAD_S = 0.15;

  private ensureCtx(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return false;
      try {
        this.ctx = new AC();
      } catch {
        return false;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.45;
      this.master.connect(this.ctx.destination);

      // Noise source for hats / snares — 0.5 s buffer, looped as needed.
      const len = Math.floor(this.ctx.sampleRate * 0.5);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { /* awaits user gesture */ });
    }
    return this.ctx.state !== 'closed';
  }

  /** Unlock audio on first user gesture (keydown / pointerdown). Safe to call repeatedly. */
  unlock(): void {
    this.ensureCtx();
    // If a track is queued but scheduler hasn't started because context was suspended,
    // kick it now.
    if (this.track && this.schedulerId == null && this.ctx?.state === 'running') {
      this.startScheduler();
    }
  }

  playTrack(id: string): void {
    if (this.currentId === id && this.schedulerId != null) return;
    this.stop();
    const track = TRACKS[id];
    if (!track) return;
    this.currentId = id;
    this.track = track;
    if (!gameState.get('soundEnabled')) return;  // remembered for later setEnabled(true)
    if (!this.ensureCtx() || !this.ctx) return;
    if (this.ctx.state === 'running') {
      this.startScheduler();
    } else {
      // Wait for the next user gesture; unlock() will call startScheduler().
      const onState = () => {
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.removeEventListener('statechange', onState);
          if (this.track && this.schedulerId == null) this.startScheduler();
        }
      };
      this.ctx.addEventListener('statechange', onState);
    }
  }

  stop(): void {
    if (this.schedulerId != null) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    this.track = null;
    this.currentId = null;
  }

  /** Toggle on/off without losing the currently-selected track. */
  setEnabled(enabled: boolean): void {
    if (!enabled) {
      const id = this.currentId;
      this.stop();
      this.currentId = id; // remember for future re-enable
    } else if (this.currentId) {
      const id = this.currentId;
      this.currentId = null;
      this.playTrack(id);
    }
  }

  private startScheduler(): void {
    if (!this.ctx) return;
    this.step = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;
    if (this.schedulerId != null) clearInterval(this.schedulerId);
    this.schedulerId = window.setInterval(() => this.tick(), this.LOOKAHEAD_MS);
  }

  private tick(): void {
    if (!this.ctx || !this.track) return;
    const stepDur = 60 / this.track.bpm / this.track.stepsPerBeat;
    while (this.nextStepTime < this.ctx.currentTime + this.SCHEDULE_AHEAD_S) {
      this.scheduleStep(this.step, this.nextStepTime, stepDur);
      this.nextStepTime += stepDur;
      this.step++;
    }
  }

  private scheduleStep(step: number, when: number, stepDur: number): void {
    if (!this.track) return;
    if (this.track.lead) this.scheduleVoice(this.track.lead, step, when, stepDur);
    if (this.track.harmony) this.scheduleVoice(this.track.harmony, step, when, stepDur);
    if (this.track.bass) this.scheduleVoice(this.track.bass, step, when, stepDur);
    if (this.track.drums) {
      for (const d of this.track.drums) this.scheduleDrum(d, step, when, stepDur);
    }
  }

  private scheduleVoice(v: Voice, step: number, when: number, stepDur: number): void {
    if (!this.ctx || !this.master) return;
    const note = v.pattern[step % v.pattern.length];
    const freq = noteToFreq(note, v.octaveShift ?? 0);
    if (freq == null) return;

    const len = stepDur * (v.noteLenFrac ?? 0.85);
    const attack = Math.min(v.attack ?? 0.006, len * 0.3);
    const release = Math.min(v.release ?? 0.05, len * 0.5);
    const peak = v.gain ?? 0.11;

    const osc = this.ctx.createOscillator();
    osc.type = v.wave ?? 'square';
    osc.frequency.value = freq;
    if (v.detune) osc.detune.value = v.detune;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + attack);
    g.gain.setValueAtTime(peak, when + Math.max(attack, len - release));
    g.gain.exponentialRampToValueAtTime(0.0001, when + len);

    osc.connect(g);
    g.connect(this.master);

    // Optional vibrato via a small LFO on the frequency.
    if (v.vibrato && v.vibrato > 0) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = v.vibrato;
      lfoGain.gain.value = freq * 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(when);
      lfo.stop(when + len + 0.02);
    }

    osc.start(when);
    osc.stop(when + len + 0.02);
  }

  private scheduleDrum(d: DrumVoice, step: number, when: number, stepDur: number): void {
    if (!this.ctx || !this.master) return;
    const hit = d.pattern[step % d.pattern.length];
    if (!hit) return;
    void stepDur;

    const type = d.type ?? 'hat';
    const decay = d.decay ?? 0.05;
    const gain = d.gain ?? 0.1;

    if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, when);
      osc.frequency.exponentialRampToValueAtTime(40, when + Math.max(0.05, decay));
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + decay + 0.02);
      osc.connect(g); g.connect(this.master);
      osc.start(when);
      osc.stop(when + decay + 0.08);
    } else {
      if (!this.noiseBuffer) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'hat' ? 'highpass' : 'bandpass';
      filter.frequency.value = type === 'hat' ? 6500 : 1600;
      filter.Q.value = type === 'hat' ? 1 : 0.7;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, when);
      g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
      src.connect(filter); filter.connect(g); g.connect(this.master);
      src.start(when);
      src.stop(when + decay + 0.05);
    }
  }
}

export const musicManager = new MusicManagerImpl();

// Unlock audio on the first user gesture — required by browser autoplay policies.
// Safe to register multiple times; the handler removes itself after the first fire.
if (typeof window !== 'undefined') {
  const unlock = () => {
    musicManager.unlock();
    window.removeEventListener('keydown', unlock, true);
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
  };
  window.addEventListener('keydown', unlock, true);
  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('touchstart', unlock, true);
}

(window as unknown as { musicManager: MusicManagerImpl }).musicManager = musicManager;
