import { Element, ElementOptions } from '@src/element';
import { fillMatrix } from '@vr-test/utils/fill-matrix';

export function createBox(
  color: string,
  x: number,
  y: number,
  focusable?: boolean,
  width = 2,
  height = 2
): ColorBox {
  return new ColorBox(color, {
    x,
    y,
    width,
    height,
    focusable: focusable !== false,
  });
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
      char: this.focused ? ' ' : 'x',
      fg: this.focused ? undefined : this.color,
      bg: this.focused ? this.color : undefined,
    });
  }
}
