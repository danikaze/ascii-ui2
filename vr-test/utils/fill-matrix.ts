import { Tile } from '@src';

export function fillMatrix(matrix: Tile[][], tile: Tile): void {
  for (const row of matrix) {
    for (let x = 0; x < row.length; x++) {
      row[x] = tile;
    }
  }
}
