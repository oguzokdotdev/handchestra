import * as Tone from 'tone';

export class Audio {
  constructor() {
    this.synth = null;
    this.reverb = null;
    this.isStarted = false;
  }

  async init() {
    // Создаем эффект объема
    this.reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.5
    }).toDestination();

    // Полифонический синтезатор (чтобы можно было играть аккордами)
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" }, // Плотный звук
      envelope: {
        attack: 0.1,
        release: 1
      }
    }).connect(this.reverb);

    this.isStarted = true;
    console.log("Audio Engine: Singing");
  }

  // Метод для запуска звука
  playNote(note) {
    if (!this.isStarted) return;
    this.synth.triggerAttackRelease(note, "8n");
  }
}