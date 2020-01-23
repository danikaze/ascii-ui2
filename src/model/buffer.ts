export interface Viewport {
  col0: number;
  row0: number;
  col1: number;
  row1: number;
}

export interface BufferOptions {
  canvas: HTMLCanvasElement;
  tileWidth: number;
  tileHeight: number;
  cols: number;
  rows: number;
  clearStyle: Tile;
}

export interface BufferRenderStats {
  /** Milliseconds the render needed */
  duration: number;
  /** Number of tiles rendered */
  tiles: number;
}

export interface TileStyle {
  /**
   * font or font-family to use in the terminal
   * The format is in this order:
   * [style] [variant] [weight] [size] [family]
   */
  font?: string;
  /** x-offset to apply to each character inside the tile */
  offsetX?: number;
  /** y-offset to apply to each character inside the tile */
  offsetY?: number;
  /** foreground color (i.e. `#00ff00`) */
  fg?: string;
  /** background color (i.e. `#000000`) */
  bg?: string;
}

export interface CharTile extends TileStyle {
  char?: string;
}

export type Tile = CharTile;
