import { Element, ElementOptions } from '@src/element';
import { fillMatrix } from '../utils/fill-matrix';

export function createBox(
  color: string,
  x: number,
  y: number,
  width = 6,
  height = 5,
  options?: ElementOptions
): ColorBox {
  return new ColorBox(color, { ...options, x, y, width, height });
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
