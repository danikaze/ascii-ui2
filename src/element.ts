import { Tile, Viewport } from '@src';
import {
  Node,
  NodeOptions,
  EventHandler,
  EventAdopted,
  Event,
  EventOrphaned,
  EventAttached,
} from './node';
import { Buffer } from './buffer';
import { resizeMatrix } from './util/resize-matrix';
import { extendObjectsOnly } from 'extend-objects-only';

/**
 * Event emmited to itself, when the element is resized
 */
export type EventResize = Event;
/**
 * Event emmited to itself, when the element gains the focus
 */
export type EventFocus = Event;
/**
 * Event emmited to itself, when the element loses the focus
 */
export type EventBlur = Event;
/**
 * Event emmited to itself, when the element is disabled
 */
export type EventDisable = Event;
/**
 * Event emmited to itself, when the element is enabled
 */
export type EventEnable = Event;

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
  /** If the element can receive focus or not (`true` by default) */
  focusable?: boolean;
  /** If `true`, the element will be disabled when created (`false` by default) */
  disabled?: boolean;
}

export interface LayoutResult {
  col: number;
  row: number;
  width: number;
  height: number;
}
export interface LayoutManager {
  positionChild?: (child: Element) => LayoutResult;
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
  /** If the element can receive focus or not */
  protected focusable: boolean;
  /** `true` if the element is focused */
  protected focused: boolean = false;
  /** If the element is disabled */
  protected disabled: boolean;
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
    this.focusable = options.focusable !== false;
    this.disabled = options.disabled === true;

    this.onAdopt = this.onAdopt.bind(this);
    this.onOrphan = this.onOrphan.bind(this);
    this.on('adopt', this.onAdopt as EventHandler);
    this.on('orphan', this.onOrphan as EventHandler);
    if ((this as LayoutManager).positionChild) {
      this.onChildrenChange = this.onChildrenChange.bind(this);
      this.on('attach', this.onChildrenChange as EventHandler);
      this.on('dettach', this.onChildrenChange as EventHandler);
    }
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
    if (col === this.x && row === this.y) return;
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
    if (columns < this.width || rows < this.height) {
      this.clearArea();
    } else if (columns === this.width && rows === this.height) {
      return;
    }

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
   * Gives the focus to the element.
   * Note that if there's no focus manager being used,
   * several elements can be focused at the same time technically
   */
  public focus(): void {
    if (!this.focusable || this.focused || this.disabled) return;
    this.focused = true;
    this.emit('focus');
  }

  /**
   * Removes the focus from the element
   */
  public blur(): void {
    if (!this.focusable || !this.focused) return;
    this.focused = false;
    this.emit('blur');
  }

  /**
   * Retrieve if the element is currentlyfocused
   */
  public isFocused(): boolean {
    return this.focused;
  }

  /**
   * Retrieve if the element can receive the focus or not
   */
  public isFocusable(): boolean {
    return this.focusable;
  }

  /**
   * Disables the element.
   * A disabled element cannot receive focus, but will receive events.
   * If used as a Widget, it will be rendered with the `disabled` style
   */
  public disable(): void {
    this.disabled = true;
    if (this.focused) this.blur();
    this.emit('disable');
  }

  /**
   * Enables the element.
   * An enabled element can receive focus
   */
  public enable(): void {
    this.disabled = false;
    this.emit('enable');
  }

  /**
   * Gets the current enabled status of the element
   */
  public isDisabled(): boolean {
    return this.disabled;
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
   * Handler called when this a child is attached to or dettached from this Element
   */
  protected onChildrenChange(event: EventAttached): void {
    if (event.target !== this) return;
    // this event is received only when this Element implements LayoutManager
    // which means that when the children change, they need to be repositioned
    for (const child of this.children) {
      child.recalculateCoords();
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
   * Recalculate internal data the Element changes
   *
   * If the parent implements the method `positionChild` of the `LayoutManager` interface,
   * then the Element's position will be decided by the parent (it's up to it to use
   * this Element's data such as the relative position, paddings, etc.)
   */
  private recalculateCoords(): void {
    const parent = this.parent as P & LayoutManager;
    const absPos = parent && parent.absPos;
    const padding = parent && parent.padding;

    if (parent && absPos && padding) {
      if (parent.positionChild) {
        const { col, row, width, height } = parent.positionChild(this);
        this.setPosition(col, row);
        this.resize(width, height);
      }
      this.absPos = {
        col0: absPos.col0 + padding.left + this.x,
        row0: absPos.row0 + padding.top + this.y,
        col1: Math.min(
          absPos.col1 - padding.right,
          absPos.col0 + this.x + this.width - 1
        ),
        row1: Math.min(
          absPos.row1 - padding.bottom,
          absPos.row0 + this.y + this.height - 1
        ),
      };
    } else {
      this.absPos = {
        col0: this.x,
        row0: this.y,
        col1: this.x + this.width - 1,
        row1: this.y + this.height - 1,
      };
    }

    for (const child of this.children) {
      child.recalculateCoords();
    }
  }
}

interface BasicElement extends Element<BasicElement, BasicElement> {}
