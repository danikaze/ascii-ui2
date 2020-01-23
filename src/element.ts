import { Node, NodeOptions, EventHandler, EventAdopted, Event } from './node';
import { Buffer } from './buffer';
import { Viewport, Tile } from './model/buffer';
import { resizeMatrix } from './util/resize-matrix';

export type EventMove = Event;
export type EventResize = Event;

export interface ElementOptions extends NodeOptions<Element, Element> {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  visible?: boolean;
}

export class Element extends Node<Element, Element> {
  protected buffer?: Buffer;
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected absPos!: Viewport;
  protected visible: boolean;
  protected readonly content: Tile[][] = [];

  constructor(options: ElementOptions = {}) {
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
   * Recalculate internal data after moving or resizing the Element
   */
  protected recalculateCoords(event?: Event): void {
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
  protected setBuffer(buffer: Buffer | undefined): void {
    this.buffer = buffer;
    for (const child of this.children) {
      child.setBuffer(buffer);
    }
  }
}
