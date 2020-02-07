import { extendObjectsOnly } from 'extend-objects-only';
import { Tile, Viewport, tileProperties, TileProperties } from '@src';
import { FocusManager, FocusManagerOptions } from './focus-manager';
import { isInsideBox } from './util/is-inside-box';
import { resizeMatrix } from './util/resize-matrix';
import { Element, Padding } from './element';

/**
 * Event triggered when the Buffer is resized
 */
export interface EventResize extends Event {
  cols: number;
  rows: number;
}
/**
 * Event triggered before the render starts
 */
export type EventPreRender = Event;
/**
 * Event triggered when the render ends
 */
export type EventRender = Event;
/**
 * Event triggered before the draw ends
 */
export type EventPreDraw = Event;
/**
 * Event triggered when the draw ends
 */
export type EventDraw = Event;

export interface BufferOptions extends FocusManagerOptions {
  /** Associated canvas element where the buffer will be rendered */
  canvas: HTMLCanvasElement;
  /** Number of columns of the buffer */
  cols: number;
  /** Number of rows of the buffer */
  rows: number;
  /** Style to use when clearing an area of the buffer */
  clearStyle: Tile;
  /** Number of tiles from the borders to leave empty (not for the children) */
  padding?: Padding;
  /** Milliseconds to pass before a tile decays (or `0` to disable the effect) */
  decayTime?: number;
}

export interface BufferRenderStats {
  /** Time when the render started */
  startTime: DOMHighResTimeStamp;
  /** Time when the render finished */
  endTime: DOMHighResTimeStamp;
  /** Milliseconds the render needed */
  duration: number;
  /** Number of tiles rendered */
  tiles: number;
}

interface Cell {
  /** Horizontal coordinates relative to the canvas in pixels */
  x: number;
  /** Vertical coordinates relative to the canvas in pixels */
  y: number;
  /** Contents of the cell */
  tile: Required<Tile>;
  /** Contents of the decaying cell */
  decayTile?: Required<Tile>;
  /** Opacity of the decaying cell */
  decayAlpha?: number;
}

/**
 * List of Element properties accessed directly from the buffer,
 * from the idea of friend classes of C++
 */
interface FriendElement {
  children: FriendElement[];
  content: Tile[][];
  absPos: Viewport;
  visible: boolean;
  recalculateCoords: () => void;
}

/**
 * Low level interface for controlling the canvas output
 */
export class Buffer<C extends Element = Element> extends FocusManager<C> {
  public static readonly defaultOptions: Omit<
    BufferOptions,
    'canvas' | 'eventTarget'
  > = {
    tileWidth: 12,
    tileHeight: 16,
    cols: 40,
    rows: 20,
    clearStyle: {
      char: '',
      font: 'bold 12px Courier New',
      offsetX: 2,
      offsetY: -1,
      fg: '#cccccc',
      bg: '#000000',
    },
    decayTime: 0,
  };

  /** Width of the tile, in pixels */
  protected tileW: number;
  /** Height of the tile in pixels */
  protected tileH: number;
  /** Number of columns of the buffer */
  protected cols: number = 0;
  /** Number of rows of the buffer */
  protected rows: number = 0;
  /** Style to be used when clearing a buffer area */
  protected clearStyle: Required<Tile>;

  /** Current buffer state */
  protected readonly matrix: Cell[][] = []; // [row][col]
  /** List of pushed viewports. Active one is `viewports[0]` */
  protected readonly viewports: Viewport[] = [];

  /** List of cells needed to be re-rendered */
  private readonly dirtyCells: Cell[] = [];
  /** Canvas element where to render the buffer contents */
  private readonly canvas: HTMLCanvasElement;
  /** Context of the canvas element usde for rendering */
  private readonly ctx: CanvasRenderingContext2D;
  /** Number of tiles from the borders to leave empty (not for the children) */
  private readonly padding: Required<Padding>;
  /** Stats about the last render */
  private readonly lastRenderStats: BufferRenderStats = {
    startTime: 0,
    endTime: 0,
    duration: 0,
    tiles: 0,
  };
  /** Ms that takes a tile to decay (`0` to disable decaying) */
  private readonly decayTime: number;
  /** Time when the last decay render was done to calculate the decay change */
  private lastDecayRenderTime: DOMHighResTimeStamp = 0;
  /**
   * Handled returned by `requestAnimationFrame`. It needs to be cancelled
   * when calling `render` manually so the draw calls are not duplicated
   */
  private requestAnimationHandler?: number;

  constructor(options: Partial<BufferOptions> & Pick<BufferOptions, 'canvas'>) {
    super({
      eventTarget: options.eventTarget || options.canvas,
      eventPreventDefault: options.eventPreventDefault,
      eventStopPropagation: options.eventStopPropagation,
      tileWidth: options.tileWidth || Buffer.defaultOptions.tileWidth,
      tileHeight: options.tileHeight || Buffer.defaultOptions.tileHeight,
    });

    this.renderCanvas = this.renderCanvas.bind(this);
    const opt = extendObjectsOnly(
      {},
      Buffer.defaultOptions,
      options
    ) as BufferOptions;

    this.canvas = opt.canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.tileW = opt.tileWidth;
    this.tileH = opt.tileHeight;
    this.clearStyle = opt.clearStyle as Required<Tile>;
    this.viewports.push({
      col0: 0,
      row0: 0,
      col1: 0,
      row1: 0,
    });
    this.padding = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...options.padding,
    };
    this.resize(opt.cols, opt.rows);
    this.decayTime = opt.decayTime!;
  }

  /**
   * Extends the `target` Tile with the `base` one values.
   * It won't overwrite values with `undefined`.
   * Unneeded values from `base` won't be copied.
   */
  public static assignTile(target: Tile, base: Tile): void {
    for (const property of tileProperties as TileProperties[]) {
      if (base[property] !== undefined) {
        // tslint:disable: no-any
        (target as any)[property] = base[property];
      }
    }
  }

  /**
   * Get the width of the buffer, in number of columns
   */
  get width(): number {
    return this.cols;
  }

  /**
   * Get the height of the buffer, in number of rows
   */
  get height(): number {
    return this.rows;
  }

  /**
   * Get the width of one tile, in pixels
   */
  get tileWidth(): number {
    return this.tileW;
  }

  /**
   * Get the height of one tile, in pixels
   */
  get tileHeight(): number {
    return this.tileH;
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
    for (const child of this.children) {
      ((child as unknown) as FriendElement).recalculateCoords();
    }
  }

  /**
   * Get stats about the last render
   */
  get renderStats(): BufferRenderStats {
    return this.lastRenderStats;
  }

  /**
   * Set contents and properties of an especified tile
   * If the position is wrong, does nothing
   */
  public setTile(col: number, row: number, tile: Partial<Tile>): void {
    if (!this.inCurrentViewport(col, row)) {
      return;
    }

    this.assignCellContents(this.matrix[row][col], tile);
  }

  /**
   * Retrieve the contents of the specified tile (will be `undefined` if the position is wrong)
   * Note that it's not a copy of the tile, so everything can be modified directly once gotten
   */
  public getTile(col: number, row: number): Tile | undefined {
    const matrixRow = this.matrix[row];
    const cell = matrixRow && matrixRow[col];
    return cell && cell.tile;
  }

  /**
   * Set the style to use in subsecuent clear calls (and resize)
   */
  public setClearStyle(style: Tile): void {
    // extendObjectsOnly instead of Object.assign so `undefined`
    // properties do not overwrite the previous value
    Buffer.assignTile(this.clearStyle, style);
  }

  /**
   * Update the buffer contents from the children, and then
   * render the changes into the canvas
   */
  public render(): void {
    this.emit('prerender');
    const { lastRenderStats } = this;
    lastRenderStats.startTime = performance.now();
    this.lastDecayRenderTime = this.lastRenderStats.startTime;

    cancelAnimationFrame(this.requestAnimationHandler as number);
    this.renderChildren((this as unknown) as FriendElement);
    lastRenderStats.tiles = this.dirtyCells.length;
    this.renderCanvas(this.lastDecayRenderTime);

    lastRenderStats.endTime = performance.now();
    lastRenderStats.duration =
      lastRenderStats.endTime - lastRenderStats.startTime;
    this.emit('render');
  }

  /**
   * Pushes a new viewport restriction. It combines with the existing one if any,
   * resulting in the intersecting area of all the applied ones.
   *
   * Viewport coordinates are inclusive (limits are considered valid)
   * If a tile is not in the viewport restrictions, it won't be modified
   */
  public pushViewport(viewport: Viewport): void {
    const currentViewport = this.viewports[0];
    this.viewports.unshift({
      col0: Math.max(currentViewport.col0, viewport.col0),
      row0: Math.max(currentViewport.row0, viewport.row0),
      col1: Math.min(currentViewport.col1, viewport.col1),
      row1: Math.min(currentViewport.row1, viewport.row1),
    });
  }

  /**
   * Removes and return the last viewport restriction
   * If `undefined` is returned, it means that there wasn't any restriction.
   * Not having any restriction means that all the tiles are editable (by default)
   */
  public popViewport(): Viewport | undefined {
    if (this.viewports.length === 1) return;
    return this.viewports.shift();
  }

  /**
   * Get the current viewport without removing it
   * It can be `undefined` if no viewport is active
   */
  get viewport(): Viewport {
    return this.viewports[0];
  }

  /**
   * Alias for `viewport`.
   * Exists for children elements whose parent is the Buffer
   */
  get absPos(): Viewport {
    return this.viewports[0];
  }

  /**
   * Resize the buffer cropping the existing content,
   * or adding empty (`clearStyle`) tiles when needed
   *
   * It also resizes the linked canvas element
   */
  public resize(cols: number, rows: number): void {
    const { canvas, clearStyle, tileW, tileH } = this;
    const screenViewport = this.viewports[this.viewports.length - 1];

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = cols * tileW * devicePixelRatio;
    canvas.height = rows * tileH * devicePixelRatio;
    canvas.style.width = `${cols * tileW}px`;
    canvas.style.height = `${rows * tileH}px`;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);

    resizeMatrix(this.matrix, cols, rows, (x, y) => ({
      x: x * tileW,
      y: y * tileH,
      tile: { ...clearStyle },
    }));

    this.cols = cols;
    this.rows = rows;
    screenViewport.col1 = cols - 1;
    screenViewport.row1 = rows - 1;

    /*
     * Usually all the render calls need to be explicit (not automatically done by the Buffer)
     * but since resizing the canvas will reset its contents completely, this time render is called
     */
    for (const row of this.matrix) {
      for (const cell of row) {
        this.dirtyCells.push(cell);
      }
    }
    this.render();
    this.emit('resize', { cols, rows });
  }

  /**
   * Reset the content of every tile of the buffer
   */
  public clear(): void;

  /**
   * Reset the specified region of the buffer
   */
  public clear(x0: number, y0: number, x1: number, y1: number): void;

  // implementation
  public clear(x0 = 0, y0 = 0, x1 = this.cols - 1, y1 = this.rows - 1): void {
    const xStart = Math.max(x0, 0);
    const yStart = Math.max(y0, 0);
    const xEnd = Math.min(x1, this.cols - 1);
    const yEnd = Math.min(y1, this.rows - 1);
    const matrix = this.matrix;

    for (let y = yStart; y <= yEnd; y++) {
      const row = matrix[y];
      for (let x = xStart; x <= xEnd; x++) {
        this.assignCellContents(row[x], this.clearStyle, true);
      }
    }
  }

  /**
   * Check if the specified tile position is inside of the viewport restrictions
   */
  protected inCurrentViewport(col: number, row: number): boolean {
    const viewport = this.viewports[0];

    return isInsideBox(
      col,
      row,
      viewport.col0,
      viewport.row0,
      viewport.col1,
      viewport.row1
    );
  }

  /**
   * Assign new contents for a valid cell, after doing checks to improve performance:
   * - Only do it when changing
   * - Avoiding adding duplicated dirty tiles
   */
  protected assignCellContents(
    cell: Cell,
    tile: Tile,
    noCheck?: boolean
  ): void {
    const oldTile = cell.tile;
    // comparison done manually because if done with Object.keys + loop is
    // slower than not applying the performance improvement
    // and still, for small renders (98 before the check => 56 after the check)
    // it doesn't become a huge improvement
    // TODO: Test with bigger/real data
    if (
      !noCheck &&
      !(
        (tile.char !== undefined && tile.char !== oldTile.char) ||
        (tile.font !== undefined && tile.font !== oldTile.font) ||
        (tile.offsetX !== undefined && tile.offsetX !== oldTile.offsetX) ||
        (tile.offsetY !== undefined && tile.offsetY !== oldTile.offsetY) ||
        (tile.fg !== undefined && tile.fg !== oldTile.fg) ||
        (tile.bg !== undefined && tile.bg !== oldTile.bg)
      )
    ) {
      return;
    }

    let decayAdded = false;
    if (this.decayTime > 0 && oldTile.char && oldTile.char !== tile.char) {
      cell.decayTile = { ...cell.tile };
      cell.decayAlpha = 1;
      if (!this.dirtyCells.includes(cell)) {
        this.dirtyCells.push(cell);
        decayAdded = true;
      }
    }

    Buffer.assignTile(cell.tile, tile);
    if (!decayAdded && !this.dirtyCells.includes(cell)) {
      this.dirtyCells.push(cell);
    }
  }

  /**
   * Render all the children of the Buffer, recursively
   *
   * Uses a nasty? way to access private properties of `Element`, based on the
   * idea of Friend classes in C++ (or the Java's `default` access modifier)
   */
  protected renderChildren(element: FriendElement): void {
    const viewport = this.viewports[0];
    const matrix = this.matrix;

    for (const elem of element.children) {
      if (!elem.visible) continue;

      const { absPos, content } = elem;
      const col0 = Math.max(viewport.col0, absPos.col0);
      const row0 = Math.max(viewport.row0, absPos.row0);
      const col1 = Math.min(viewport.col1, absPos.col1);
      const row1 = Math.min(viewport.row1, absPos.row1);
      const dx = col0 - absPos.col0 - absPos.col0;
      const dy = row0 - absPos.row0 - absPos.row0;
      for (let absY = row0; absY <= row1; absY++) {
        for (let absX = col0; absX <= col1; absX++) {
          this.assignCellContents(
            matrix[absY][absX],
            content[absY + dy][absX + dx]
          );
        }
      }

      if (elem.children.length > 0) {
        this.pushViewport(elem.absPos);
        this.renderChildren(elem);
        this.popViewport();
      }
    }
  }

  /**
   * Actually render the needed tiles (dirty ones) to the canvas
   */
  private renderCanvas(startTime: DOMHighResTimeStamp): void {
    this.emit('predraw');

    const { ctx, tileW, tileH, decayTime } = this;
    const originalAlpha = ctx.globalAlpha;
    const decayChange =
      decayTime > 0 &&
      Math.max(0, (startTime - this.lastDecayRenderTime) / decayTime);

    ctx.textBaseline = 'bottom';
    let renderNextDecay = false;

    for (let i = this.dirtyCells.length - 1; i >= 0; i--) {
      const cell = this.dirtyCells[i];
      const { x, y, tile, decayTile } = cell;

      // bg
      ctx.fillStyle = tile.bg;
      ctx.fillRect(x, y, tileW, tileH);

      // decay
      if (decayTile) {
        renderNextDecay = true;
        ctx.globalAlpha = cell.decayAlpha!;
        ctx.font = decayTile.font;
        ctx.fillStyle = decayTile.fg;
        ctx.fillText(
          decayTile.char,
          x + decayTile.offsetX,
          y + tileH + decayTile.offsetY
        );
        cell.decayAlpha! -= decayChange as number;
        if (cell.decayAlpha! <= 0) {
          cell.decayTile = undefined;
        }
        ctx.globalAlpha = originalAlpha;
      }

      // fg
      if (tile.char) {
        ctx.font = tile.font;
        ctx.fillStyle = tile.fg;
        ctx.fillText(tile.char, x + tile.offsetX, y + tileH + tile.offsetY);
      }

      if (!decayTile || cell.decayAlpha! <= 0) {
        this.dirtyCells.splice(i, 1);
      }
    }

    this.emit('draw');

    if (renderNextDecay) {
      this.lastDecayRenderTime = startTime;
      this.requestAnimationHandler = requestAnimationFrame(this.renderCanvas);
    }
  }
}
