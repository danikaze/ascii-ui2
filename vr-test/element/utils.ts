import { Tile } from '@src';
import { Element, ElementOptions } from '@src/element';

export function fillMatrix(matrix: Tile[][], tile: Tile): void {
  for (const row of matrix) {
    for (let x = 0; x < row.length; x++) {
      row[x] = tile;
    }
  }
}

export function createBox(
  color: string,
  x: number,
  y: number,
  width = 6,
  height = 5
): ColorBox {
  return new ColorBox(color, { x, y, width, height });
}

export class ColorBox extends Element {
  protected readonly color: string;

  constructor(color: string, options: ElementOptions) {
    super(options);
    this.color = color;
    this.setContent();
  }

  protected setContent(): void {
    fillMatrix(this.content, { char: 'x', fg: this.color });
  }
}
