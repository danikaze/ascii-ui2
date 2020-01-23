import { Buffer } from '@src/buffer';
import { TestCases } from '@test';

// tslint:disable: no-magic-numbers
function resetBuffer(canvas: HTMLCanvasElement): Buffer {
  const buffer = new Buffer({
    canvas,
    cols: 10,
    rows: 10,
  });
  buffer.setClearStyle({ bg: 'red' });
  return buffer;
}

export const data: TestCases = [
  {
    description: 'Clear all',
    test: ({ canvas }) => {
      const buffer = resetBuffer(canvas);
      buffer.clear();
      buffer.render();
    },
  },
  {
    description: 'Clear center',
    test: ({ canvas }) => {
      const buffer = resetBuffer(canvas);
      buffer.clear(2, 2, 7, 7);
      buffer.render();
    },
  },
  {
    description: 'Clear y-outbounds',
    test: ({ canvas }) => {
      const buffer = resetBuffer(canvas);
      buffer.clear(3, -1, 6, 11);
      buffer.render();
    },
  },
  {
    description: 'Clear x-outbounds',
    test: ({ canvas }) => {
      const buffer = resetBuffer(canvas);
      buffer.clear(-1, 3, 11, 6);
      buffer.render();
    },
  },
  {
    description: 'No-clear due to wrong coords',
    test: ({ canvas }) => {
      const buffer = resetBuffer(canvas);
      buffer.clear(5, 5, 1, 1);
      buffer.render();
    },
  },
];
