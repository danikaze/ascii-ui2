import { Tile, Viewport } from '@src';
import {
  Node,
  NodeOptions,
  EventHandler,
  EventAdopted,
  Event,
  EventOrphaned,
} from './node';
import { Buffer } from './buffer';
import { resizeMatrix } from './util/resize-matrix';
import { extendObjectsOnly } from 'extend-objects-only';

/**
 * Event emmited to itself, when the element is resized
 */
export type EventResize = Event;

export interface Padding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ElementOptions<
  C extends Element = Element,
  P extends Element = Element
> extends NodeOptions<C, P> {
  /** Column relative to its parent position */
  x?: number;
  /** Row relative to its parent position */
  y?: number;
  /** Width of the element in number of columns */
  width?: number;
  /** Height of the element in number of columns */
  height?: number;
  /** If visible or not by default */
  visible?: boolean;
  /** Number of tiles from the borders to leave empty (not for the children) */
  padding?: Padding;
}

export class Element<
  C extends Element = BasicElement,
  P extends Element = BasicElement
> extends Node<C, P> {
  /** Content of the element to be rendered */
  protected readonly content: Tile[][] = [];
  /** Position of the element in columns relative to its parent */
  protected x: number;
  /** Position of the element in rows relative to its parent */
  protected y: number;
  /** Width of the element in number of columns */
  protected width: number;
  /** Height of the element in number of columns */
  protected height: number;
  /** Absolute position of the element relative to the buffer */
  protected absPos!: Viewport;
  /** If the element is visible or hidden */
  protected visible: boolean;
  /** Associated buffer (needed for clearing the element area) */
  private buffer?: Buffer;
  /** Number of tiles from the borders to leave empty (not for the children) */
  private readonly padding: Required<Padding>;

  constructor(options: ElementOptions<C, P> = {}) {
    super(options);

    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 0;
    this.height = options.height || 0;
    this.visible = options.visible !== false;
    this.padding = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...options.padding,
    };

    this.onAdopt = this.onAdopt.bind(this);
    this.onOrphan = this.onOrphan.bind(this);
    this.on('adopt', this.onAdopt as EventHandler);
    this.on('orphan', this.onOrphan as EventHandler);
    this.recalculateCoords();
    resizeMatrix(this.content, this.width, this.height, {});
  }

  /**
   * Retrieve the column of the top-left corner of the Element, relative to its parent
   */
  public getX(): number {
    return this.x;
  }

  /**
   * Set the column of the top-left corner of the Element, relative to its parent
   */
  public setX(column: number): void {
    this.setPosition(column, this.y);
  }

  /**
   * Retrieve the row of the top-left corner of the Element, relative to its parent
   */
  public getY(): number {
    return this.y;
  }

  /**
   * Set the row of the top-left corner of the Element, relative to its parent
   */
  public setY(row: number): void {
    this.setPosition(this.x, row);
  }

  /**
   * Get the element padding definition
   */
  public getPadding(): Padding {
    return this.padding;
  }

  /**
   * Set new padding values.
   * This values will combine with the existing ones
   */
  public setPadding(padding: Padding): void {
    extendObjectsOnly(this.padding, padding);
    this.recalculateCoords();
  }

  /**
   * Get the bounding rectangle of the element, in absolute coordinates
   */
  public getBounds(): Viewport {
    return this.absPos;
  }

  /**
   * Set the position for the Element, relative to its parent
   */
  public setPosition(col: number, row: number): void {
    this.clearArea();
    this.x = col;
    this.y = row;
    this.recalculateCoords();
  }

  /**
   * Moves the element the specified columns and rows
   */
  public move(columns: number, rows: number): void {
    this.setPosition(this.x + columns, this.y + rows);
  }

  /**
   * Retrieve the width of the element
   */
  public getWidth(): number {
    return this.width;
  }

  /**
   * Change the width of the element
   */
  public setWidth(columns: number): void {
    this.resize(columns, this.height);
  }

  /**
   * Retrieve the height of the element
   */
  public getHeight(): number {
    return this.height;
  }

  /**
   * Change the height of the element
   */
  public setHeight(rows: number): void {
    this.resize(this.width, rows);
  }

  /**
   * Set a new size for the Element
   */
  public resize(columns: number, rows: number): void {
    this.width = columns;
    this.height = rows;
    this.recalculateCoords();
    resizeMatrix(this.content, columns, rows, {});
    this.setContent();
    this.emit('resize');
  }

  /**
   * Shows the element making it visible
   */
  public show(): void {
    this.visible = true;
  }

  /**
   * Hides the element making it invisible
   */
  public hide(): void {
    this.clearArea();
    this.visible = false;
  }

  /**
   * Switch between showing/not-showing
   */
  public toggle(): void {
    if (this.visible) {
      return this.hide();
    }
    this.show();
  }

  /**
   * Gets if the element is currently visible or not
   */
  public isVisible(): boolean {
    return this.visible;
  }

  /**
   * This is the function each Element should implement, to set the visible contents
   * Note that this only updates the element content, but not the buffer itself, so
   * a `buffer.render()` call is still required
   */
  protected setContent(): void {}

  /**
   * Remove the this element's content from the buffer clearing it
   */
  protected clearArea(): void {
    if (this.buffer && this.visible) {
      this.buffer.clear(
        this.absPos.col0,
        this.absPos.row0,
        this.absPos.col1,
        this.absPos.row1
      );
    }
  }

  /**
   * Handler called when this Element is attached to another one
   */
  protected onAdopt(event: EventAdopted): void {
    this.setBuffer(
      this.parent instanceof Buffer ? this.parent : this.parent!.buffer
    );
    this.recalculateCoords();
    event.stopImmediatePropagation();
  }

  /**
   * Handler called when this Element is dettached from its parent
   */
  protected onOrphan(event: EventOrphaned): void {
    this.clearArea();
    this.setBuffer(undefined);
    event.stopImmediatePropagation();
  }

  /**
   * Set the specified buffer to the Element and all its children
   */
  private setBuffer(buffer: Buffer | undefined): void {
    this.buffer = buffer;
    for (const child of this.children) {
      child.setBuffer(buffer);
    }
  }

  /**
   * Recalculate internal data after moving or resizing the Element
   */
  private recalculateCoords(): void {
    const parentPos = this.parent && this.parent.absPos;
    const parentPadding = this.parent && this.parent.padding;
    this.absPos = {
      col0:
        (parentPos ? parentPos.col0 : 0) +
        (parentPadding ? parentPadding.left : 0) +
        this.x,
      row0:
        (parentPos ? parentPos.row0 : 0) +
        (parentPadding ? parentPadding.top : 0) +
        this.y,
      col1: Math.min(
        (parentPos ? parentPos.col1 : Infinity) -
          (parentPadding ? parentPadding.right : 0),
        (parentPos ? parentPos.col0 : 0) + this.x + this.width - 1
      ),
      row1: Math.min(
        (parentPos ? parentPos.row1 : Infinity) -
          (parentPadding ? parentPadding.bottom : 0),
        (parentPos ? parentPos.row0 : 0) + this.y + this.height - 1
      ),
    };

    for (const child of this.children) {
      child.recalculateCoords();
    }
  }
}

interface BasicElement extends Element<BasicElement, BasicElement> {}
