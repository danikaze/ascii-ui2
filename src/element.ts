import { Tile, Viewport } from '@src';
import { Node, NodeOptions, EventHandler, EventAdopted, Event } from './node';
import { Buffer } from './buffer';
import { resizeMatrix } from './util/resize-matrix';

/**
 * Event emmited to each children of the Element, when the element is moved
 */
export type EventMove = Event;
/**
 * Event emmited to itself, when the element is resized
 */
export type EventResize = Event;

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

  constructor(options: ElementOptions<C, P> = {}) {
    super(options);

    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 0;
    this.height = options.height || 0;
    this.visible = options.visible !== false;

    this.recalculateCoords = this.recalculateCoords.bind(this);
    this.onAdopt = this.onAdopt.bind(this);
    this.onOrphan = this.onOrphan.bind(this);
    this.on('adopt', this.onAdopt as EventHandler);
    this.on('orphan', this.onOrphan);
    this.on('move', this.recalculateCoords as EventHandler);
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
   * Get the bounding rectangle of the element, in absolute coordinates
   */
  public getBounds(): Viewport {
    return this.absPos;
  }

  /**
   * Set the position for the Element, relative to its parent
   */
  public setPosition(col: number, row: number): void {
    if (this.visible) {
      this.clearArea();
    }
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
    if (this.visible) return;
    this.visible = true;
  }

  /**
   * Hides the element making it invisible
   */
  public hide(): void {
    if (!this.visible) return;
    this.visible = false;
    this.clearArea();
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
    if (this.buffer) {
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
    event.stopPropagation();
  }

  /**
   * Handler called when this Element is dettached from its parent
   */
  protected onOrphan(): void {
    this.clearArea();
    this.setBuffer(undefined);
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
  private recalculateCoords(event?: Event): void {
    const parentPos = this.parent && this.parent.absPos;
    this.absPos = {
      col0: (parentPos ? parentPos.col0 : 0) + this.x,
      row0: (parentPos ? parentPos.row0 : 0) + this.y,
      col1: (parentPos ? parentPos.col0 : 0) + this.x + this.width - 1,
      row1: (parentPos ? parentPos.row0 : 0) + this.y + this.height - 1,
    };

    if (event) {
      event.stopPropagation();
    }

    for (const child of this.children) {
      child.emit('move');
    }
  }
}

interface BasicElement extends Element<BasicElement, BasicElement> {}
