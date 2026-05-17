import * as Tone from 'tone';
import { Camera } from './modules/Camera';
import { Tracker } from './modules/Tracker';
import { Visuals } from './modules/Visuals';
import { Audio } from './modules/Audio';
import { getDistance } from './utils/math';
import { LandmarkSmoother } from './utils/smooth';

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');

const camera = new Camera(videoElement);
const tracker = new Tracker();
const visuals = new Visuals(canvasElement);
const audio = new Audio();
let audioStarted = false;
const smoother = new LandmarkSmoother(0.4);

let lastNoteTime = 0;
const NOTE_COOLDOWN = 300;

window.addEventListener('click', async () => {
  if (!audioStarted) {
    try {
      await Tone.start();
      await audio.init();
      audioStarted = true;
      console.log("Audio started and Context resumed");
      document.body.style.cursor = 'none'; 
    } catch (e) {
      console.error("Failed to start audio:", e);
    }
  }
});

function processFrame() {
  const startTimeMs = performance.now();
  const results = tracker.detect(videoElement, startTimeMs);

  if (results && results.landmarks) {
   const smoothed = smoother.smooth(results.landmarks); // <-- вот здесь
   visuals.draw(smoothed);

    if (audioStarted) {
      const now = performance.now();
      smoothed.forEach(hand => {
        const thumbTip = hand[4];
        const indexTip = hand[8];
        
        const distance = getDistance(thumbTip, indexTip);

        if (distance < 0.05 && now - lastNoteTime > NOTE_COOLDOWN) {
          const pitch = Math.floor((1 - indexTip.y) * 24) + 48; 
          const note = Tone.Frequency(pitch, "midi").toNote();
          audio.playNote(note);
          lastNoteTime = now;
        }
      });
    }
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
    console.error("App start failed:", err);
  }
}

startApp();