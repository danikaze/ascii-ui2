import { Buffer } from '@src/buffer';
import { TestCases } from '@test';
import { ColorBox, createBox } from './utils';

let buffer: Buffer;
let red: ColorBox;
let yellow: ColorBox;
let green: ColorBox;

function resetBuffer(canvas: HTMLCanvasElement) {
  buffer?.clearInputEventListeners();
  buffer = new Buffer({
    canvas,
    cols: 16,
    rows: 13,
  });
}

// tslint:disable: no-magic-numbers
export const data: TestCases = [
  {
    description: 'Render simple elements',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      yellow = createBox('yellow', 1, 1);
      red = createBox('red', 8, 4);

      buffer.append(red);
      buffer.append(yellow);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Modifying elements should re-render them properly',
    test: () => {
      yellow.move(2, 0);
      red.setY(red.getY() + 3);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Resizing an element should clear the needed area',
    test: () => {
      red.resize(red.getWidth() - 1, red.getHeight() - 2);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Overlapping elements should be rendered properly too',
    test: () => {
      green = createBox('green', 5, 4);
      buffer.append(green);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Removing an element, should leave the others visible',
    test: () => {
      buffer.remove(green);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Hide an element',
    test: () => {
      yellow.hide();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Show an element again',
    test: () => {
      yellow.show();
      buffer.render();

      return { buffer };
    },
  },
];
