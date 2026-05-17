/**
 * Вычисляет расстояние между двумя точками в 2D или 3D пространстве.
 * Точки p1 и p2 должны иметь свойства x и y (от 0 до 1).
 */
export function getDistance(p1, p2) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + 
    Math.pow(p1.y - p2.y, 2)
  );
}

/**
 * Опционально: функция для маппинга диапазонов (понадобится позже)
 * Например, перевести координату 0...1 в герцы 200...2000
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}