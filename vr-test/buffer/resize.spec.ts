import { Buffer } from '@src/buffer';
import { TestCases } from '@test';

let buffer: Buffer;

// tslint:disable: no-magic-numbers
export const data: TestCases = [
  {
    description: 'Initialize the buffer to 4 columns x 4 rows',
    test: ({ canvas }) => {
      buffer = new Buffer({
        canvas,
        cols: 4,
        rows: 4,
      });

      return { buffer };
    },
  },
  {
    description: 'Remove rows',
    test: () => {
      buffer.resize(4, 2);

      return { buffer };
    },
  },
  {
    description: 'Remove columns',
    test: () => {
      buffer.resize(2, 2);

      return { buffer };
    },
  },
  {
    description: 'Add columns before rows',
    test: () => {
      buffer.setClearStyle({ bg: 'red' });
      buffer.resize(4, 2);

      return { buffer };
    },
  },
  {
    description: 'Add rows',
    test: () => {
      buffer.setClearStyle({ bg: 'green' });
      buffer.resize(4, 4);

      return { buffer };
    },
  },
  {
    description: 'Add rows before columns',
    test: () => {
      buffer.resize(2, 2);
      buffer.setClearStyle({ bg: 'green' });
      buffer.resize(2, 4);

      return { buffer };
    },
  },
  {
    description: 'Add columns',
    test: () => {
      buffer.setClearStyle({ bg: 'red' });
      buffer.resize(4, 4);

      return { buffer };
    },
  },
  {
    description: 'Add columns and rows',
    test: () => {
      buffer.setClearStyle({ bg: 'blue' });
      buffer.resize(2, 2);
      buffer.resize(4, 4);

      return { buffer };
    },
  },
];
