import { extendObjectsOnly } from 'extend-objects-only';
import { BufferOptions, Tile, Viewport } from './model/buffer';
import { isInsideBox } from './util/is-inside-box';

interface Cell {
  /** Horizontal coordinates relative to the canvas in pixels */
  x: number;
  /** Vertical coordinates relative to the canvas in pixels */
  y: number;
  /** Contents of the cell */
  tile: Required<Tile>;
}

/**
 * Low level interface for controlling the canvas output
 */
export class Buffer {
  public static readonly defaultOptions: Omit<BufferOptions, 'canvas'> = {
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
  };

  /*
   * Options-related vars
   */
  protected readonly canvas: HTMLCanvasElement;
  protected readonly ctx: CanvasRenderingContext2D;
  protected tileW: number;
  protected tileH: number;
  protected cols: number = 0;
  protected rows: number = 0;
  protected clearStyle: Required<Tile>;
  protected dirtyTiles: Cell[] = [];

  /*
   * State-related vars
   */
  /** Current buffer state */
  protected readonly matrix: Cell[][] = []; // [row][col]
  /** List of pushed viewports. Active one is `viewports[0]`, if any */
  protected readonly viewports: Viewport[] = [];

  constructor(options: Partial<BufferOptions> & Pick<BufferOptions, 'canvas'>) {
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
    this.resize(opt.cols, opt.rows);
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
  get tileWidth() {
    return this.tileW;
  }

  /**
   * Get the height of one tile, in pixels
   */
  get tileHeight() {
    return this.tileH;
  }

  /**
   * Set contents and properties of an especified tile
   * If the position is wrong, does nothing
   */
  public setTile(col: number, row: number, tile: Partial<Tile>): void {
    if (
      !this.isValidTilePosition(col, row) ||
      !this.inCurrentViewport(col, row)
    ) {
      return;
    }

    const cell = this.matrix[row][col];
    Object.assign(cell.tile, tile);
    this.dirtyTiles.push(cell);
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
    Object.assign(this.clearStyle, style);
  }

  /**
   * Render the changes into the canvas
   */
  public render(): void {
    const { ctx, tileW, tileH } = this;

    ctx.textBaseline = 'bottom';
    for (const cell of this.dirtyTiles) {
      const { x, y, tile } = cell;

      if (tile.bg) {
        ctx.fillStyle = tile.bg;
        ctx.fillRect(x, y, tileW, tileH);
      }

      if (tile.char) {
        ctx.font = tile.font;
        ctx.fillStyle = tile.fg;
        ctx.fillText(tile.char, x + tile.offsetX, y + tileH + tile.offsetY);
      }
    }
    this.dirtyTiles = [];
  }

  /**
   * Pushes a new viewport restriction
   *
   * Viewport coordinates are inclusive (limits are considered valid)
   * If a tile is not in the viewport restrictions, it won't be modified
   */
  public pushViewport(viewport: Viewport): void {
    this.viewports.unshift({ ...viewport });
  }

  /**
   * Removes and return the last viewport restriction
   * If `undefined` is returned, it means that there wasn't any restriction.
   * Not having any restriction means that all the tiles are editable (by default)
   */
  public popViewport(): Viewport | undefined {
    return this.viewports.shift();
  }

  /**
   * Get the current viewport without removing it
   * It can be `undefined` if no viewport is active
   */
  get viewport(): Viewport | undefined {
    return this.viewports[0];
  }

  /**
   * Resize the buffer cropping the existing content,
   * or adding empty (`clearStyle`) tiles when needed
   *
   * It also resizes the linked canvas element
   */
  public resize(cols: number, rows: number): void {
    const { canvas, clearStyle, tileW, tileH, matrix } = this;

    canvas.width = cols * tileW;
    canvas.height = rows * tileH;

    // resize vertical
    if (rows < this.rows) {
      matrix.splice(rows);
    } else if (rows > this.rows) {
      for (let y = this.rows; y < rows; y++) {
        const row = (matrix[y] = [] as Cell[]);
        for (let x = 0; x < cols; x++) {
          row[x] = {
            x: x * tileW,
            y: y * tileH,
            tile: { ...clearStyle },
          };
        }
      }
    }

    // resize horizontal
    if (cols < this.cols) {
      for (const row of matrix) {
        row.splice(cols);
      }
    } else if (cols > this.cols) {
      for (let y = 0; y < rows; y++) {
        const row = matrix[y];
        for (let x = this.cols; x < cols; x++) {
          row[x] = {
            x: x * tileW,
            y: y * tileH,
            tile: { ...clearStyle },
          };
        }
      }
    }

    this.cols = cols;
    this.rows = rows;
    /*
     * Usually all the render calls need to be explicit (not automatically done by the Buffer)
     * but since resizing the canvas will reset its contents completely, this time render is called
     */
    for (const row of this.matrix) {
      for (const cell of row) {
        this.dirtyTiles.push(cell);
      }
    }
    this.render();
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
        Object.assign(row[x].tile, this.clearStyle);
        this.dirtyTiles.push(row[x]);
      }
    }
  }

  /**
   * Check if the specified tile position is inside the matrix
   */
  protected isValidTilePosition(col: number, row: number): boolean {
    return isInsideBox(col, row, 0, 0, this.cols - 1, this.rows - 1);
  }

  /**
   * Check if the specified tile position is inside of the viewport restrictions
   */
  protected inCurrentViewport(col: number, row: number): boolean {
    const viewport = this.viewports[0];

    return (
      !viewport ||
      isInsideBox(
        col,
        row,
        viewport.col0,
        viewport.row0,
        viewport.col1,
        viewport.row1
      )
    );
  }
}
