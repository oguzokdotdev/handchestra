// Квадранты экрана → инструменты
// Левая рука пользователя = правая в данных (зеркало)
//
//  STRINGS  |  BRASS
// ----------+----------
//   BASS    |  PLUCK

export const INSTRUMENTS = {
  STRINGS: 'strings',
  BRASS: 'brass',
  BASS: 'bass',
  PLUCK: 'pluck',
};

export class Zones {
  constructor(canvasElement) {
    this.canvas = canvasElement;
  }

  // Возвращает инструмент по нормализованным координатам (0..1)
  getInstrument(x, y) {
    const left = x < 0.5;
    const top = y < 0.5;

    if (top && left)  return INSTRUMENTS.STRINGS;
    if (top && !left) return INSTRUMENTS.BRASS;
    if (!top && left) return INSTRUMENTS.BASS;
    return INSTRUMENTS.PLUCK;
  }

  // Рисуем зоны на canvas как подсказку
  draw(ctx, activeInstrument = null) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const zones = [
        { instrument: INSTRUMENTS.STRINGS, x: 0,     y: 0,     label: 'STRINGS' },
        { instrument: INSTRUMENTS.BRASS,   x: w / 2, y: 0,     label: 'BRASS'   },
        { instrument: INSTRUMENTS.BASS,    x: 0,     y: h / 2, label: 'BASS'    },
        { instrument: INSTRUMENTS.PLUCK,   x: w / 2, y: h / 2, label: 'PLUCK'   },
    ];

    for (const zone of zones) {
        const isActive = zone.instrument === activeInstrument;

        ctx.fillStyle = isActive
        ? 'rgba(0, 212, 255, 0.08)'
        : 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(zone.x, zone.y, w / 2, h / 2);

        // Флипаем контекст чтобы текст не зеркалился
        ctx.save();
        ctx.scale(-1, 1);
        ctx.font = '13px ui-monospace, monospace';
        ctx.fillStyle = isActive
        ? 'rgba(0, 212, 255, 0.9)'
        : 'rgba(255, 255, 255, 0.2)';
        // X инвертируем: зона.x + 20 → -(зона.x + w/2 - 20)
        ctx.fillText(zone.label, -(zone.x + w / 2 - 20), zone.y + 32);
        ctx.restore();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
}
}