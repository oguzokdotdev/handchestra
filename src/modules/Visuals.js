import { Zones } from './Zones';

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17]
];

export class Visuals {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.zones = new Zones(canvasElement);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  draw(landmarks, activeInstrument = null) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Зоны фоном
    this.zones.draw(this.ctx, activeInstrument);

    if (!landmarks) return;

    for (const hand of landmarks) {
      this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = '#00d4ff';

      for (const [a, b] of CONNECTIONS) {
        const p1 = hand[a];
        const p2 = hand[b];
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.canvas.width, p1.y * this.canvas.height);
        this.ctx.lineTo(p2.x * this.canvas.width, p2.y * this.canvas.height);
        this.ctx.stroke();
      }

      for (const point of hand) {
        const x = point.x * this.canvas.width;
        const y = point.y * this.canvas.height;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = '#00d4ff';
        this.ctx.fill();
      }
    }
  }
}