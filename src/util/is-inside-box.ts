/**
 * Check if the given point (x, y) is inside a box where it's top-left is
 * at (x0, y0) and the bottom-right at (x1, y1)
 * Borders count as inside
 */
export function isInsideBox(
  x: number,
  y: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): boolean {
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}
