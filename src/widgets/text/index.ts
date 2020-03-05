import { Tile } from '@src';
import { clamp } from '@src/util/clamp';
import {
  TextHorizontalAlignment,
  TextVerticalAlignment,
  parseText,
} from '@src/util/parse-text';
import { Widget, WidgetOptions, BasicStyles } from '..';
import { ELLIPSIS } from '../constants';
import { textStyles } from './constants';

export type TextStyles = BasicStyles | 'filler';

/**
 * How the text should behave if it doesn't fit in one line:
 * - wrap: jump to the next line
 * - hidden: just display as much as possible
 * - ellipsis: same as hidden, but show an ellipsis (…) if there's something hidden
 */
export type TextHorizontalOverflow = 'wrap' | 'hidden' | 'ellipsis';
/**
 * How the text should behave if there are hidden lines:
 * - hidden: just display as much as possible
 * - ellipsis: same as hidden, but show an ellipsis (…) if there's something hidden
 */
export type TextVerticalOverflow = 'hidden' | 'ellipsis';

export interface TextOptions extends WidgetOptions<TextStyles> {
  /** The text itself */
  text: string;
  /** Horizontal text alignment (`left` by default) */
  hAlign?: TextHorizontalAlignment;
  /** Vertical text alignment (`top` by default) */
  vAlign?: TextVerticalAlignment;
  /** Horizontal overflow behavior (`wrap` by default) */
  hOverflow?: TextHorizontalOverflow;
  /** Vertical overflow behavior (`hidden` by default) */
  vOverflow?: TextVerticalOverflow;
  /**
   * If `true`, it won't allow empty lines at the end of a page and the text will
   * end at the last line of the widget.
   * If `false` (by default), it will be possible to scroll while at least one line is visible
   */
  allowEmptyScrollLines?: boolean;
}

export class Text extends Widget<TextStyles> {
  private text: string;
  private readonly hAlign: TextHorizontalAlignment;
  private readonly vAlign: TextVerticalAlignment;
  private readonly hOverflow: TextHorizontalOverflow;
  private readonly vOverflow: TextVerticalOverflow;
  private readonly allowEmptyScrollLines: boolean;
  /** Full content to use in `setContent` (after text has been parsed and formatted) */
  private fullContent: Tile[][] = [];
  /** First column to show when scrolling */
  private scrollFirstCol: number = 0;
  /** First row to show when scrolling */
  private scrollFirstRow: number = 0;
  /** Last possible column to scroll to */
  private scrollMaxFirstCol: number = 0;
  /** Last possible row to scroll to */
  private scrollMaxFirstRow: number = 0;

  constructor(options: TextOptions) {
    super(options, textStyles);

    this.parseText = this.parseText.bind(this);
    this.text = options.text;
    this.hAlign = options.hAlign || 'left';
    this.vAlign = options.vAlign || 'top';
    this.hOverflow = options.hOverflow || 'wrap';
    this.vOverflow = options.vOverflow || 'hidden';
    this.allowEmptyScrollLines = !!options.allowEmptyScrollLines;

    this.parseText();

    this.on('resize', this.parseText);
  }

  /**
   * Update the text contents
   */
  public setText(text: string): void {
    this.text = text;
    this.parseText();
  }

  /**
   * Retrieve the last content set (including all their tags if any)
   */
  public getText(): string {
    return this.text;
  }

  /**
   * Return the full width of the content.
   * Unlike the `widget.width` which only returns the visible part,
   * this will return the size for the hidden part also.
   * Basically returns the size of the longest line of the text.
   */
  public getContentFullWidth(): number {
    return this.fullContent.reduce((max, row) => Math.max(max, row.length), 0);
  }

  /**
   * Return the full height of the content.
   * Unlike the `widget.height` which only returns the visible part,
   * this will return the size for the hidden part also
   */
  public getContentFullHeight(): number {
    return this.fullContent.length;
  }

  /**
   * Scroll to the specified position.
   * If the value is a number (`0`, `10`, ...) it's a row or column number
   * If the value is a string (`'0'`, `'25%'`) it will be treated as a percentage
   */
  public scrollTo(col: number | string, row: number | string): void {
    // tslint:disable: no-magic-numbers ban
    const numericRow =
      typeof row === 'number'
        ? row
        : (parseFloat(row) * this.scrollMaxFirstRow) / 100;
    const newRow = clamp(numericRow, 0, this.scrollMaxFirstRow);

    const numericCol =
      typeof col === 'number'
        ? col
        : (parseFloat(col) * this.scrollMaxFirstCol) / 100;
    const newCol = clamp(numericCol, 0, this.scrollMaxFirstCol);

    if (newCol === this.scrollFirstCol && newRow === this.scrollFirstRow) {
      return;
    }

    this.scrollFirstCol = newCol;
    this.scrollFirstRow = newRow;
    this.setContent();
  }

  /**
   * Scroll the specified number of columns and rows
   */
  public scroll(cols: number, rows: number): void {
    this.scrollTo(this.scrollFirstCol + cols, this.scrollFirstRow + rows);
  }

  /**
   * Scroll the specified number of horizontal and vertical pages
   */
  public scrollPages(h: number, v: number): void {
    this.scrollTo(
      this.scrollFirstCol + h * (this.width - 1),
      this.scrollFirstRow + v * (this.height - 1)
    );
  }

  /**
   * Horizontally scroll the text to set the provided value as the first column
   */
  public scrollToColumn(col: number): void {
    this.scrollTo(col, this.scrollFirstRow);
  }

  /**
   * Vertically scroll the text to set the provided value as the first row
   */
  public scrollToRow(row: number): void {
    this.scrollTo(this.scrollFirstCol, row);
  }

  /**
   * Get a number [0-1] indicating the progress of the vertical scroll
   */
  public getVerticalScrollProgress(): number {
    return this.scrollFirstRow / this.scrollMaxFirstRow;
  }

  /**
   * Get a number [0-1] indicating the progress of the horizontal scroll
   */
  public getHorizontalScrollProgress(): number {
    return this.scrollFirstCol / this.scrollMaxFirstCol;
  }

  protected setContent(): void {
    const emptyTile = this.getStyle('filler');

    for (let y = 0; y < this.content.length; y++) {
      const targetRow = this.content[y];
      const sourceRow = this.fullContent[y + this.scrollFirstRow];
      for (let x = 0; x < targetRow.length; x++) {
        targetRow[x] =
          (sourceRow && sourceRow[x + this.scrollFirstCol]) || emptyTile;
      }
      if (
        this.hOverflow === 'ellipsis' &&
        sourceRow &&
        this.scrollFirstCol + this.width < sourceRow.length
      ) {
        targetRow[targetRow.length - 1] = {
          ...targetRow[targetRow.length - 1],
          char: ELLIPSIS,
        };
      }
    }
    if (
      this.vOverflow === 'ellipsis' &&
      this.scrollFirstRow + this.height < this.fullContent.length
    ) {
      this.content[this.height - 1][this.width - 1] = {
        ...this.content[this.height - 1][this.width - 1],
        char: ELLIPSIS,
      };
    }
  }

  /**
   * Function creating the `fullContent` property from a styled text, so it can
   * be reused across multiple renderings and scrolls
   */
  private parseText(): void {
    // parse the text
    this.fullContent = parseText(this.text, {
      width: this.hOverflow === 'wrap' ? this.width : undefined,
      height: this.height,
      hAlign: this.hAlign,
      vAlign: this.vAlign,
      defaultStyle: this.getStyle(),
      filler: this.getStyle('filler'),
    });

    // pre-calculate text-dependant values
    this.scrollMaxFirstRow =
      this.fullContent.length - (this.allowEmptyScrollLines ? 1 : this.height);
    this.scrollMaxFirstCol =
      this.fullContent.reduce((max, row) => Math.max(row.length, max), 0) -
      this.width;

    // set the content to render
    this.setContent();
  }
}
