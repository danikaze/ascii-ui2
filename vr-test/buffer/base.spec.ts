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

      // tslint:disable: no-console
      // TODO: Add a way to test this properly with puppeteer
      buffer.on('keydown', e => console.log('keydown', e));
      buffer.on('click', e => console.log('click', e));
      buffer.on('mousedown', e => console.log('mousedown', e));
      buffer.on('mouseenter', e => console.log('mouseenter', e));
      buffer.on('mouseleave', e => console.log('mouseleave', e));
      buffer.on('mousemove', e => console.log('mousemove', e));
      buffer.on('mouseout', e => console.log('mouseout', e));
      buffer.on('mouseover', e => console.log('mouseover', e));
      buffer.on('mouseup', e => console.log('mouseup', e));
      buffer.on('keydown', e => console.log('keydown', e));
      buffer.on('keyup', e => console.log('keyup', e));
      buffer.on('keypress', e => console.log('keypress', e));
      buffer.on('focus', () => console.log('focus'));
      buffer.on('blur', () => console.log('blur'));
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
