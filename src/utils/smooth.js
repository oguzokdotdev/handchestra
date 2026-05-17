/**
 * Exponential Moving Average сглаживатель для landmarks.
 * alpha: 0.0 = максимальное сглаживание (инертно)
 *        1.0 = без сглаживания (сырые данные)
 */
export class LandmarkSmoother {
  constructor(alpha = 0.5) {
    this.alpha = alpha;
    this.previous = null;
  }

  smooth(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      this.previous = null;
      return landmarks;
    }

    if (!this.previous || this.previous.length !== landmarks.length) {
      this.previous = landmarks.map(hand => hand.map(p => ({ ...p })));
      return landmarks;
    }

    const smoothed = landmarks.map((hand, hi) =>
      hand.map((point, pi) => {
        const prev = this.previous[hi]?.[pi];
        if (!prev) return point;
        return {
          x: prev.x + this.alpha * (point.x - prev.x),
          y: prev.y + this.alpha * (point.y - prev.y),
          z: prev.z + this.alpha * (point.z - prev.z),
        };
      })
    );

    this.previous = smoothed;
    return smoothed;
  }

  reset() {
    this.previous = null;
  }
}