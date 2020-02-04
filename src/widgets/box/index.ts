import { Widget, WidgetOptions, BasicStyles } from '..';
import { singleLineBorders, doubleLineBorders, boxStyles } from './constants';
import { Padding } from '@src/element';
import { ELLIPSIS } from '../constants';

export type BoxStyles = BasicStyles | 'borders' | 'borders.focused';

export interface BoxBorders {
  center: string;
  topLeft: string;
  top: string;
  topRight: string;
  left: string;
  right: string;
  bottomLeft: string;
  bottom: string;
  bottomRight: string;
}

export interface BoxOptions extends WidgetOptions<BoxStyles> {
  /** Characters to use for each part of the box borders */
  borders?: 'none' | 'single-line' | 'double-line' | BoxBorders;
  /** Label to show in the border top (won't be shown if borders is 'none') */
  label?: string;
  /** Spaces to open at the label sides */
  labelPadding?: Pick<Padding, 'left' | 'right'>;
  /** Text alignment for the label */
  labelAlign?: 'left' | 'center' | 'right';
}

export class Box extends Widget<BoxStyles> {
  protected borders?: BoxBorders;
  private label?: string;
  private readonly labelPadding: Required<Pick<Padding, 'left' | 'right'>>;
  private readonly labelAlign: 'left' | 'center' | 'right';

  constructor(options: BoxOptions) {
    super(options, boxStyles);

    const borders = options.borders || 'single-line';
    if (typeof borders === 'object') {
      this.borders = borders;
    } else if (borders === 'single-line') {
      this.borders = singleLineBorders;
    } else if (borders === 'double-line') {
      this.borders = doubleLineBorders;
    } else if (borders === 'none') {
      this.borders = undefined;
    }

    this.label = options.label;
    this.labelPadding = { left: 0, right: 0, ...options.labelPadding };
    this.labelAlign = options.labelAlign || 'left';

    this.setContent();
  }

  /**
   * Get the current label
   */
  public getLabel(): string | undefined {
    return this.label;
  }

  /**
   * Set a new label text
   */
  public setLabel(label: string | undefined): void {
    this.label = label;
    this.setContent(true);
  }

  protected setContent(onlyLabel?: boolean): void {
    const borders = this.borders;

    const lastX = this.width - 1;
    const lastY = this.height - 1;

    // center
    let baseStyle = this.getStyle();

    if (borders) {
      const center = { ...baseStyle, char: borders.center };
      for (let y = 1; y < lastY; y++) {
        for (let x = 1; x < lastX; x++) {
          this.content[y][x] = center;
        }
      }
    } else {
      const center = { ...baseStyle, char: '' };
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.content[y][x] = center;
        }
      }
      return;
    }

    baseStyle = this.getStyle('borders');

    if (onlyLabel) {
      const topBorder = { ...baseStyle, char: borders.top };
      for (let x = 1; x < lastX; x++) {
        this.content[0][x] = topBorder;
      }
    } else {
      // corners
      this.content[0][0] = { ...baseStyle, char: borders.topLeft };
      this.content[0][lastX] = { ...baseStyle, char: borders.topRight };
      this.content[lastY][0] = {
        ...baseStyle,
        char: borders.bottomLeft,
      };
      this.content[lastY][lastX] = {
        ...baseStyle,
        char: borders.bottomRight,
      };

      // horizontal lines
      const topBorder = { ...baseStyle, char: borders.top };
      const bottomBorder = { ...baseStyle, char: borders.bottom };
      for (let x = 1; x < lastX; x++) {
        this.content[0][x] = topBorder;
        this.content[lastY][x] = bottomBorder;
      }

      // vertical lines
      const leftBorder = { ...baseStyle, char: borders.left };
      const rightBorder = { ...baseStyle, char: borders.right };
      for (let y = 1; y < lastY; y++) {
        this.content[y][0] = leftBorder;
        this.content[y][lastX] = rightBorder;
      }
    }

    // label
    if (!this.label || !this.borders) return;
    const availableSpace =
      this.width - 2 - this.labelPadding.left - this.labelPadding.right;
    const labelWidth = Math.min(this.label.length, availableSpace);

    if (labelWidth < 1) return;
    const labelText =
      labelWidth >= this.label.length
        ? this.label
        : `${this.label.substr(0, labelWidth - 1)}${ELLIPSIS}`;
    let x =
      this.labelAlign === 'left'
        ? this.labelPadding.left + 1
        : this.labelAlign === 'center'
        ? this.labelPadding.left +
          1 +
          Math.floor((availableSpace - labelWidth) / 2)
        : this.width - 1 - this.labelPadding.right - labelWidth;

    for (const char of labelText) {
      this.content[0][x++] = { ...baseStyle, char };
    }
  }
}
