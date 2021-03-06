import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Element } from '@src/element';
import { createBox } from './utils';

let buffer: Buffer;
let red: Element;
let green: Element;
let blue: Element;
let yellow: Element;

export const data: TestCases = [
  {
    description: 'No element is focused at the beginning',
    test: async ({ canvas }) => {
      // tslint:disable: no-magic-numbers
      buffer = new Buffer({ canvas, cols: 4, rows: 4 });

      red = createBox('red', 0, 0, 2, 2, { focusable: true });
      green = createBox('green', 2, 0, 2, 2, { focusable: true });
      blue = createBox('blue', 0, 2, 2, 2, { focusable: true });
      yellow = createBox('yellow', 2, 2, 2, 2, { focusable: true });

      buffer.append(red);
      buffer.append(green);
      buffer.append(blue);
      buffer.append(yellow);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Focus the red element. Only one should be focused.',
    test: async () => {
      red.focus();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Focus the green element. Only one should be focused.',
    test: async () => {
      green.focus();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Focus the blue element. Only one should be focused.',
    test: async () => {
      blue.focus();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Focus the yellow element. Only one should be focused.',
    test: async () => {
      yellow.focus();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Blur the focus. Nothing should be focused.',
    test: async () => {
      yellow.blur();
      buffer.render();

      return { buffer };
    },
  },
];
