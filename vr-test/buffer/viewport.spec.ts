import { Buffer } from '@src/buffer';
import { Tile } from '@src/model/buffer';
import { TestCases } from '@test';

let buffer: Buffer;

// tslint:disable: no-magic-numbers
function resetBuffer(canvas: HTMLCanvasElement): void {
  buffer = new Buffer({
    canvas,
    cols: 10,
    rows: 10,
  });
}

function writeAllBuffer(buffer: Buffer, extra?: Tile): void {
  for (let y = 0; y < buffer.height; y++) {
    for (let x = 0; x < buffer.width; x++) {
      buffer.setTile(x, y, { char: 'x', ...extra });
    }
  }
  buffer.render();
}

export const data: TestCases = [
  {
    description: 'No viewport',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      writeAllBuffer(buffer);
    },
  },
  {
    description: 'Viewport: full (same as none)',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      buffer.pushViewport({
        col0: 0,
        row0: 0,
        col1: buffer.width - 1,
        row1: buffer.height - 1,
      });
      writeAllBuffer(buffer);
    },
  },
  {
    description: 'Viewport: center',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      buffer.pushViewport({
        col0: 1,
        row0: 1,
        col1: buffer.width - 2,
        row1: buffer.height - 2,
      });
      writeAllBuffer(buffer);
    },
  },
  {
    description: 'Viewport: outbounds',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      buffer.pushViewport({
        col0: -2,
        row0: -2,
        col1: buffer.width + 2,
        row1: buffer.height + 2,
      });
      writeAllBuffer(buffer);
    },
  },
  {
    description: `Shouldn't affect current contents`,
    test: ({ canvas }) => {
      resetBuffer(canvas);
      writeAllBuffer(buffer);
      buffer.pushViewport({
        col0: 2,
        row0: 2,
        col1: buffer.width - 3,
        row1: buffer.height - 3,
      });
      writeAllBuffer(buffer, { fg: 'red' });
    },
  },
];
