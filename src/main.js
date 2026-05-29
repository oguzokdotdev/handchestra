import * as Tone from 'tone';
import { Camera } from './modules/Camera';
import { Tracker } from './modules/Tracker';
import { Visuals } from './modules/Visuals';
import { Audio } from './modules/Audio';
import { Conductor } from './modules/Conductor';
import { LandmarkSmoother } from './utils/smooth';

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');

const camera = new Camera(videoElement);
const tracker = new Tracker();
const visuals = new Visuals(canvasElement);
const audio = new Audio();
const smoother = new LandmarkSmoother(0.4);
let conductor = null;
let audioStarted = false;

window.addEventListener('click', async () => {
  if (!audioStarted) {
    try {
      await Tone.start();
      await audio.init();
      conductor = new Conductor(canvasElement, audio);
      audioStarted = true;
      console.log('Audio started');
      document.body.style.cursor = 'none';
    } catch (e) {
      console.error('Failed to start audio:', e);
    }
  }
});

function processFrame() {
  const startTimeMs = performance.now();
  const results = tracker.detect(videoElement, startTimeMs);

  if (results?.landmarks) {
    const smoothed = smoother.smooth(results.landmarks);

    // Conductor интерпретирует движения
    let activeInstrument = null;
    if (audioStarted && conductor) {
      ({ activeInstrument } = conductor.interpret(smoothed, results.handedness));
    }

    // Visuals рисует зоны + скелет
    visuals.draw(smoothed, activeInstrument);
  } else if (audioStarted && conductor) {
    conductor.interpret(null, null);
  }

  requestAnimationFrame(processFrame);
}

async function startApp() {
  try {
    visuals.resize();
    window.addEventListener('resize', () => visuals.resize());
    await camera.init();
    await tracker.init();
    processFrame();
  } catch (err) {
    console.error('App start failed:', err);
  }
}

startApp();