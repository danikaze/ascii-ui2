type ContentFunction<T> = (x: number, y: number) => T;

/**
 * Resize the given matrix to the specified dimensions.
 * If a size is smaller, it will be spliced.
 * If it's bigger, it will be increased adding the specified content
 */
export function resizeMatrix<T>(
  matrix: T[][],
  cols: number,
  rows: number,
  content?: T | ContentFunction<T>
): void {
  const isFn = typeof content === 'function';
  const currentRows = matrix.length;
  const currentCols = (matrix[0] && matrix[0].length) || 0;

  // resize vertical
  if (rows < currentRows) {
    matrix.splice(rows);
  } else if (rows > currentRows) {
    for (let y = currentRows; y < rows; y++) {
      const row = (matrix[y] = [] as T[]);
      for (let x = 0; x < cols; x++) {
        row[x] = (isFn ? (content as ContentFunction<T>)(x, y) : content) as T;
      }
    }
  }

  // resize horizontal
  if (cols < currentCols) {
    for (const row of matrix) {
      row.splice(cols);
    }
  } else if (cols > currentCols) {
    for (let y = 0; y < rows; y++) {
      const row = matrix[y];
      for (let x = currentCols; x < cols; x++) {
        row[x] = (isFn ? (content as ContentFunction<T>)(x, y) : content) as T;
      }
    }
  }
}
