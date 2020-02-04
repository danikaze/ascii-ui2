export interface Viewport {
  /** Column of the top-left corner of the Viewport */
  col0: number;
  /** Row of the top-left corner of the Viewport */
  row0: number;
  /** Column of the bottom-right corner of the Viewport */
  col1: number;
  /** Row of the bottom-right corner of the Viewport */
  row1: number;
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
  /** Character to type in the tile */
  char?: string;
}

export const tileProperties = [
  'font',
  'offsetX',
  'offsetY',
  'fg',
  'bg',
  'char',
];
export type TileProperties =
  | 'font'
  | 'offsetX'
  | 'offsetY'
  | 'fg'
  | 'bg'
  | 'char';

export type Tile = CharTile;
