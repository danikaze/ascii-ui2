import { Buffer } from '@src/buffer';
import { Tile, Viewport } from '@src/model/buffer';
import { TestCases } from '@test';

let buffer: Buffer;
const intersection1: Viewport = {
  col0: 1,
  row0: 1,
  col1: 5,
  row1: 5,
};
const intersection2: Viewport = {
  col0: 4,
  row0: 4,
  col1: 8,
  row1: 8,
};

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
  {
    description: `A single viewport...`,
    test: ({ canvas }) => {
      resetBuffer(canvas);
      buffer.pushViewport(intersection1);
      writeAllBuffer(buffer, { fg: 'red' });
      buffer.popViewport();
    },
  },
  {
    description: `Another single viewport...`,
    test: () => {
      buffer.pushViewport(intersection2);
      writeAllBuffer(buffer, { fg: 'green' });
      buffer.popViewport();
    },
  },
  {
    description: `When applied both, only the intersection should be editable`,
    test: () => {
      buffer.pushViewport(intersection1);
      buffer.pushViewport(intersection2);
      writeAllBuffer(buffer, { fg: 'yellow' });
    },
  },
  {
    description: `Removing only the last viewport should leave the previous one`,
    test: () => {
      buffer.popViewport();
      writeAllBuffer(buffer, { fg: 'pink' });
    },
  },
  {
    description: `Removing all viewports should be all the buffer editable`,
    test: () => {
      let v = buffer.popViewport();
      while (v) {
        v = buffer.popViewport();
      }
      writeAllBuffer(buffer, { fg: 'white' });
    },
  },
];
