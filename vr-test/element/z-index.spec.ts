import { Buffer } from '@src/buffer';
import { TestCases } from '@test';
import { ColorBox, createBox } from './utils';

let buffer: Buffer;
let red: ColorBox;
let yellow: ColorBox;
let green: ColorBox;

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
    description:
      'Render overlapping elements. Last ones appended should be over others',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      red = createBox('red', 1, 1);
      yellow = createBox('yellow', 5, 4);
      green = createBox('green', 9, 7);

      buffer.append(red);
      buffer.append(yellow);
      buffer.append(green);
      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Modifying overlapping elements should not change their z-index order',
    test: () => {
      yellow.move(-1, -1);
      yellow.resize(yellow.getWidth() + 2, yellow.getHeight() + 2);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Hiding the element should not change their z-index order',
    test: () => {
      yellow.toggle();
      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Showing the element again should not change their z-index order',
    test: () => {
      yellow.toggle();
      buffer.render();

      return { buffer };
    },
  },
];
