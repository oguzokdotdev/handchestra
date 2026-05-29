import { Zones } from './Zones';
import { getDistance, mapRange } from '../utils/math';
import * as Tone from 'tone';

export class Conductor {
  constructor(canvasElement, audio) {
    this.zones = new Zones(canvasElement);
    this.audio = audio;
    this.activeInstrument = null;
  }

  // Главный метод — вызывается каждый кадр
  interpret(landmarks, handedness) {
    if (!landmarks || !handedness) {
      this.audio.stopAll();
      this.activeInstrument = null;
      return { activeInstrument: null };
    }

    let rightHand = null; // В данных MediaPipe = "Left" (зеркало)
    let leftHand = null;  // В данных MediaPipe = "Right" (зеркало)

    landmarks.forEach((hand, i) => {
    const label = handedness[i]?.[0]?.categoryName;
    if (label === 'Right') rightHand = hand; // было 'Left'
    if (label === 'Left')  leftHand = hand;  // было 'Right'
    });

    console.log(handedness.map(h => h?.[0]?.categoryName)); // <-- сюда

    // Правая рука — мелодия
    if (rightHand) {
      this._handleRightHand(rightHand);
    } else {
      this.audio.stopAll();
      this.activeInstrument = null;
    }

    // Левая рука — микшер
    if (leftHand) {
      this._handleLeftHand(leftHand);
    }

    return { activeInstrument: this.activeInstrument };
  }

  _handleRightHand(hand) {
    const wrist = hand[0];
    const instrument = this.zones.getInstrument(wrist.x, wrist.y);

    // Если сменила зону — остановить предыдущий инструмент
    if (this.activeInstrument && this.activeInstrument !== instrument) {
      this.audio.stopNote(this.activeInstrument);
    }

    this.activeInstrument = instrument;

    // Расстояние большой↔указательный → питч
    const distance = getDistance(hand[4], hand[8]);
    const midi = Math.round(mapRange(distance, 0.02, 0.25, 72, 48));
    const clamped = Math.max(36, Math.min(84, midi));
    const note = Tone.Frequency(clamped, 'midi').toNote();

    this.audio.playNote(instrument, note);
  }

  _handleLeftHand(hand) {
    const wrist = hand[0];

    // Y: 0 = верх экрана (тихо → громко снизу вверх)
    const volume = 1 - wrist.y;
    this.audio.setVolume(volume);

    // Расстояние пальцев → открытость фильтра
    const distance = getDistance(hand[4], hand[8]);
    const filterNorm = mapRange(distance, 0.02, 0.25, 0, 1);
    this.audio.setFilter(Math.max(0, Math.min(1, filterNorm)));
  }
}