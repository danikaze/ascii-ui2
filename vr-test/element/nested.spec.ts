import { Buffer } from '@src/buffer';
import { TestCases } from '@test';
import { ColorBox, createBox } from './utils';

let buffer: Buffer;
let red: ColorBox;
let yellow: ColorBox;
let green: ColorBox;
let white: ColorBox;
let lightGreen: ColorBox;

function resetBuffer(canvas: HTMLCanvasElement) {
  buffer = new Buffer({
    canvas,
    cols: 16,
    rows: 13,
  });
}

// tslint:disable: no-magic-numbers
export const data: TestCases = [
  {
    description: 'Render nested elements: yellow > red',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      yellow = createBox('yellow', 2, 2, 6, 6);
      red = createBox('red', 1, 1, 4, 4);
      yellow.append(red);
      buffer.append(yellow);

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Render nested overflowing elements: yellow > red',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      yellow = createBox('yellow', 2, 2, 6, 6);
      red = createBox('red', 4, 4, 4, 4);
      yellow.append(red);
      buffer.append(yellow);

      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Render complex nested element structure (yellow > red) & (green > white > lightgreen)',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      yellow = createBox('yellow', 1, 1, 6, 6);
      buffer.append(yellow);
      red = createBox('red', 1, 1, 4, 4);
      yellow.append(red);

      green = createBox('green', 6, 6, 8, 5);
      buffer.append(green);
      white = createBox('white', 1, 1, 4, 3);
      green.append(white);
      lightGreen = createBox('#00ff00', -1, 1, 8, 1);
      white.append(lightGreen);

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Hiding an element should hide its children too',
    test: () => {
      green.toggle();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Showing it again should show all its children too',
    test: () => {
      green.toggle();
      buffer.render();

      return { buffer };
    },
  },
];
