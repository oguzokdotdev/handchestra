import * as Tone from 'tone';

const SYNTH_CONFIGS = {
  strings: {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.4, decay: 0.1, sustain: 0.8, release: 1.5 },
  },
  brass: {
    oscillator: { type: 'square' },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.8 },
  },
  bass: {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.6, release: 1.0 },
  },
  pluck: {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.6 },
  },
};

export class Audio {
  constructor() {
    this.synths = {};
    this.filter = null;
    this.volume = null;
    this.activeNotes = {}; // instrument → current note
    this.isStarted = false;
  }

  async init() {
    // Мастер-цепочка: Filter → Volume → Reverb → Destination
    const reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).toDestination();
    this.volume = new Tone.Volume(0).connect(reverb);
    this.filter = new Tone.Filter(4000, 'lowpass').connect(this.volume);

    // Создаём синтезатор для каждого инструмента
    for (const [name, config] of Object.entries(SYNTH_CONFIGS)) {
      this.synths[name] = new Tone.Synth(config).connect(this.filter);
    }

    this.isStarted = true;
    console.log('Audio Engine: Ready');
  }

  // Правая рука: играть ноту на инструменте
  playNote(instrument, note) {
    if (!this.isStarted) return;

    const synth = this.synths[instrument];
    if (!synth) return;

    // Если нота не изменилась — не перезапускаем
    if (this.activeNotes[instrument] === note) return;

    // Останавливаем предыдущую
    if (this.activeNotes[instrument]) {
      synth.triggerRelease();
    }

    synth.triggerAttack(note);
    this.activeNotes[instrument] = note;
  }

  // Правая рука ушла из зоны
  stopNote(instrument) {
    if (!this.isStarted) return;
    if (!this.activeNotes[instrument]) return;

    this.synths[instrument]?.triggerRelease();
    delete this.activeNotes[instrument];
  }

  // Левая рука: громкость (-40дб..0дб)
  setVolume(normalized) {
    if (!this.isStarted) return;
    const db = (normalized - 1) * 40; // 0 → -40db, 1 → 0db
    this.volume.volume.rampTo(db, 0.05);
  }

  // Левая рука: фильтр (200гц..8000гц)
  setFilter(normalized) {
    if (!this.isStarted) return;
    const freq = 200 + normalized * 7800;
    this.filter.frequency.rampTo(freq, 0.05);
  }

  stopAll() {
    for (const instrument of Object.keys(this.activeNotes)) {
      this.stopNote(instrument);
    }
  }
}