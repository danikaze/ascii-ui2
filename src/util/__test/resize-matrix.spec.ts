import { describe, it } from 'mocha';
import { assert } from 'chai';
import { resizeMatrix } from '../resize-matrix';

function createMatrix<T>(width: number, height: number, content?: T): T[][] {
  const m: T[][] = [];

  for (let y = 0; y < height; y++) {
    const row: T[] = [];
    m[y] = row;
    for (let x = 0; x < width; x++) {
      row[x] = content as T;
    }
  }

  return m;
}

function getMatrixSize(matrix: unknown[][]): { width: number; height: number } {
  if (matrix.length === 0) return { width: 0, height: 0 };
  return {
    height: matrix.length,
    width: matrix[0].length,
  };
}

function iterateMatrix<T>(
  matrix: T[][],
  callback: (content: T, x: number, y: number) => void
): void {
  const { height, width } = getMatrixSize(matrix);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      callback(matrix[y][x], x, y);
    }
  }
}

describe('resizeMatrix', () => {
  // tslint:disable:no-magic-numbers
  it('Should apply the changes to the provided object (no copy)', () => {
    const matrix = createMatrix(3, 2, 1);
    assert.deepEqual(getMatrixSize(matrix), { width: 3, height: 2 });
    assert.isUndefined(resizeMatrix(matrix, 4, 4));

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(
        cell,
        x < 3 && y < 2 ? 1 : undefined,
        `(${x}, ${y}) is ${cell}`
      );
    });
  });

  it('Should expand horizontally', () => {
    const matrix = createMatrix(2, 2);
    resizeMatrix(matrix, 4, 2, 'x');
    assert.deepEqual(getMatrixSize(matrix), { width: 4, height: 2 });

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(
        cell,
        x < 2 && y < 2 ? undefined : 'x',
        `(${x}, ${y}) is ${cell}`
      );
    });
  });

  it('Should expand vertically', () => {
    const matrix = createMatrix(2, 2);
    resizeMatrix(matrix, 2, 4, true);
    assert.deepEqual(getMatrixSize(matrix), { width: 2, height: 4 });

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(
        cell,
        x < 2 && y < 2 ? undefined : true,
        `(${x}, ${y}) is ${cell}`
      );
    });
  });

  it('Should expand diagonally', () => {
    const matrix = createMatrix(2, 2);
    resizeMatrix(matrix, 4, 4, 'd');
    assert.deepEqual(getMatrixSize(matrix), { width: 4, height: 4 });

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(
        cell,
        x < 2 && y < 2 ? undefined : 'd',
        `(${x}, ${y}) is ${cell}`
      );
    });
  });

  it('Should shrink horizontally', () => {
    const matrix = createMatrix(4, 4, 'x');
    resizeMatrix(matrix, 2, 4);
    assert.deepEqual(getMatrixSize(matrix), { width: 2, height: 4 });

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(cell, 'x', `(${x}, ${y}) is ${cell}`);
    });
  });

  it('Should shrink vertically', () => {
    const matrix = createMatrix(4, 4, 'x');
    resizeMatrix(matrix, 4, 2);
    assert.deepEqual(getMatrixSize(matrix), { width: 4, height: 2 });

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(cell, 'x', `(${x}, ${y}) is ${cell}`);
    });
  });

  it('Should shrink diagonally', () => {
    const matrix = createMatrix(4, 4, 'x');
    resizeMatrix(matrix, 2, 2);
    assert.deepEqual(getMatrixSize(matrix), { width: 2, height: 2 });

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(cell, 'x', `(${x}, ${y}) is ${cell}`);
    });
  });

  it('Should not change if the size is the same', () => {
    const matrix = createMatrix(4, 4, 'x');
    resizeMatrix(matrix, 4, 4);
    assert.deepEqual(getMatrixSize(matrix), { width: 4, height: 4 });

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(cell, 'x', `(${x}, ${y}) is ${cell}`);
    });
  });

  it('Should expand diagonally accepting a function as new content', () => {
    const matrix = createMatrix(2, 2);
    resizeMatrix(matrix, 4, 4, (x, y) => `${x},${y}`);
    assert.deepEqual(getMatrixSize(matrix), { width: 4, height: 4 });

    iterateMatrix(matrix, (cell, x, y) => {
      assert.strictEqual(
        cell,
        x < 2 && y < 2 ? undefined : `${x},${y}`,
        `(${x}, ${y}) is ${cell}`
      );
    });
  });
});
