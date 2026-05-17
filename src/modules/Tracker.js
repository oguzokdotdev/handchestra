import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const MIN_CONFIDENCE = 0.75;
const MAX_HAND_SPAN = 0.55; // Максимальная ширина/высота "руки" (0..1)

function isValidHand(landmarks) {
  const xs = landmarks.map(p => p.x);
  const ys = landmarks.map(p => p.y);

  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = maxY - minY;

  // Фильтр по размеру — немного мягче
  if (spanX > 0.6 || spanY > 0.6) return false;

  // Запястье должно быть в нижних 50% (было 35%)
  const wrist = landmarks[0];
  const wristRelY = (wrist.y - minY) / (spanY || 1);
  if (wristRelY < 0.5) return false;

  // Достаточно ОДНОГО пальца выше запястья (было 2)
  const TIPS = [4, 8, 12, 16, 20];
  const tipsAboveWrist = TIPS.filter(i => landmarks[i].y < wrist.y - spanY * 0.15);
  if (tipsAboveWrist.length < 1) return false;

  return true;
}

export class Tracker {
  constructor() {
    this.handLandmarker = null;
  }

  async init() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });

    console.log("Handchestra Brain: Ready");
  }

  detect(video, time) {
    if (!this.handLandmarker) return null;

    const results = this.handLandmarker.detectForVideo(video, time);

    if (results?.landmarks && results?.handedness) {
      results.landmarks = results.landmarks.filter((landmarks, i) => {
        const score = results.handedness[i]?.[0]?.score ?? 0;
        return score >= MIN_CONFIDENCE && isValidHand(landmarks);
      });
    }

    return results;
  }
}