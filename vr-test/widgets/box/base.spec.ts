// tslint:disable: no-magic-numbers
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Box } from '@src/widgets/box';

let buffer: Buffer;
let defaultBox: Box;
let styledBox: Box;

function resetBuffer(canvas: HTMLCanvasElement) {
  buffer?.clearInputEventListeners();
  buffer = new Buffer({
    canvas,
    cols: 16,
    rows: 10,
  });
}

export const data: TestCases = [
  {
    description: 'Basic Box rendering',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      defaultBox = new Box({
        x: 1,
        y: 1,
        width: 10,
        height: 3,
      });

      styledBox = new Box({
        x: 1,
        y: 5,
        width: 8,
        height: 3,
        borders: 'double-line',
        styles: {
          bg: '#aaa',
          focused: {
            bg: '#ddd',
          },
          borders: {
            fg: '#aaa',
            bg: '#777',
            focused: {
              fg: '#ddd',
              bg: '#aaa',
            },
            disabled: {
              bg: '#333',
            },
          },
        },
      });

      buffer.append(defaultBox);
      buffer.append(styledBox);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Default box focused and resizing',
    test: () => {
      defaultBox.focus();
      defaultBox.resize(defaultBox.getWidth() + 1, defaultBox.getHeight() + 1);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Styled box focused and resizing',
    test: () => {
      styledBox.focus();
      styledBox.resize(styledBox.getWidth() + 3, styledBox.getHeight() + 1);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Disabled boxes',
    test: () => {
      defaultBox.disable();
      styledBox.disable();
      buffer.render();

      return { buffer };
    },
  },
];
