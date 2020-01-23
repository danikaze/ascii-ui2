import { Buffer } from '@src/buffer';
import { TestCases } from '@test';

let buffer: Buffer;

export const data: TestCases = [
  {
    description: 'Nothing should be rendered until Buffer.render is called',
    test: ({ canvas }) => {
      let x = 0;
      const y = 0;
      buffer = new Buffer({
        canvas,
      });

      buffer.setTile(x++, y, { char: 'H' });
      buffer.setTile(x++, y, { char: 'e' });
      buffer.setTile(x++, y, { char: 'l' });
      buffer.setTile(x++, y, { char: 'l' });
      buffer.setTile(x++, y, { char: 'o' });
      buffer.setTile(x++, y, { char: ' ' });
      buffer.setTile(x++, y, { char: 'W' });
      buffer.setTile(x++, y, { char: 'o' });
      buffer.setTile(x++, y, { char: 'r' });
      buffer.setTile(x++, y, { char: 'l' });
      buffer.setTile(x++, y, { char: 'd' });
      buffer.setTile(x++, y, { char: '!' });
    },
  },
  {
    description: 'Buffer.render() is called, and text should appear',
    test: () => {
      buffer.render();
    },
  },
  {
    description: 'Should not fail even writing outside the buffer',
    test: () => {
      buffer.setTile(-1, 0, { char: 'x' });
      buffer.setTile(0, -1, { char: 'x' });
      buffer.setTile(-1, -1, { char: 'x' });
      buffer.setTile(buffer.width, 0, { char: 'x' });
      buffer.setTile(0, buffer.height, { char: 'x' });
      buffer.setTile(buffer.width, buffer.height, { char: 'x' });
    },
  },
];
