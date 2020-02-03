import { Element, ElementOptions, LayoutResult } from '@src/element';
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
    this.on('blur focus', this.setContent.bind(this));
  }

  protected setContent(): void {
    this.clearArea();
    fillMatrix(this.content, {
      char: this.disabled ? '.' : this.focused ? ' ' : 'x',
      fg: this.focused ? undefined : this.color,
      bg: this.focused ? this.color : undefined,
    });
  }
}

export class Container extends Element {
  protected readonly color: string;

  constructor(color: string, options: ElementOptions) {
    super(options);
    this.color = color;
    this.setContent();
  }

  protected setContent(): void {
    fillMatrix(this.content, { char: '|', fg: this.color });
  }

  protected positionChild(child: Element): LayoutResult {
    const n = this.children.length;

    const i = this.children.indexOf(child);
    const col = Math.floor((this.width / n) * i);
    const width = Math.floor((this.width / n) * (i + 1)) - col;

    return {
      col,
      width,
      row: 0,
      height: this.height,
    };
  }
}
