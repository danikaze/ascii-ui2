import { Buffer } from '@src/buffer';
import { TestCases } from '@test';
import { TileStyle } from '@src';

let buffer: Buffer;

function writeText(
  x: number,
  y: number,
  text: string,
  style?: TileStyle
): void {
  let col = x;
  for (const char of text) {
    buffer.setTile(col++, y, { ...style, char });
  }
}

export const data: TestCases = [
  {
    description: 'Nothing should be rendered until Buffer.render is called',
    test: ({ canvas }) => {
      buffer = new Buffer({
        canvas,
      });

      writeText(0, 0, 'Hello world!');
    },
  },
  {
    description: 'Buffer.render() is called, and text should appear',
    test: () => {
      buffer.render();
    },
  },
  {
    description: 'Full tile styling test',
    test: () => {
      const x = 1;
      let y = 1;
      const defaultFont = Buffer.defaultOptions.clearStyle.font;

      // tslint:disable: no-magic-numbers
      buffer.setTile(buffer.width - 4, y, { bg: 'red' });
      buffer.setTile(buffer.width - 3, y, { bg: 'green' });
      buffer.setTile(buffer.width - 2, y, { bg: 'blue' });

      writeText(x, ++y, 'Yellow text', { fg: 'yellow' });
      writeText(x, ++y, '#6ad080 text', { fg: '#6ad080' });
      writeText(x, ++y, 'Red background text', { bg: 'red' });
      writeText(x, ++y, 'offsetX +3 text', { offsetX: 3 });
      writeText(x, ++y, 'offsetY +10 text', { offsetY: 10 });
      writeText(5, ++y, 'note how the text rendered', { fg: 'white' });
      writeText(5, ++y, ' out of its tile is only', { fg: 'white' });
      writeText(5, ++y, ' overwritten when rendering', { fg: 'white' });
      writeText(5, ++y, ' over it', { fg: 'white' });
      writeText(x, ++y, 'Italic text', {
        font: `italic ${defaultFont}`,
      });
      writeText(x, ++y, 'Bold text', {
        font: `bold ${defaultFont}`,
      });
      writeText(x, ++y, 'small-caps text', {
        font: `small-caps ${defaultFont}`,
      });

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
