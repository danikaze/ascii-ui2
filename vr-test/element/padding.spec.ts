import { assert } from 'chai';
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { ColorBox, createBox } from './utils';
import { Padding } from '@src/element';

let buffer: Buffer;
let red: ColorBox;
let yellow: ColorBox;

const noPadding: Padding = { top: 0, right: 0, bottom: 0, left: 0 };

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
    description: 'Red has padding (top: 1, right: 0, bottom: 2, left: 3)',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      const redPadding = {
        top: 1,
        right: 0,
        bottom: 2,
        left: 3,
      };
      red = createBox('red', 1, 1, 14, 11, {
        padding: redPadding,
      });
      yellow = createBox('yellow', 0, 0, red.getWidth(), red.getHeight());

      buffer.append(red);
      red.append(yellow);
      buffer.render();

      assert.deepEqual(red.getPadding(), redPadding);
      assert.deepEqual(yellow.getPadding(), noPadding);

      return { buffer };
    },
  },
  {
    description: 'Red has only partial padding (top: 1, bottom: 2)',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      red = createBox('red', 1, 1, 14, 11, {
        padding: {
          top: 1,
          bottom: 2,
        },
      });
      yellow = createBox('yellow', 0, 0, red.getWidth(), red.getHeight());

      buffer.append(red);
      red.append(yellow);
      buffer.render();

      assert.deepEqual(red.getPadding(), {
        top: 1,
        bottom: 2,
        left: 0,
        right: 0,
      });

      return { buffer };
    },
  },
  {
    description: 'Set padding of the red element to all 2',
    test: () => {
      red.setPadding({
        top: 2,
        right: 2,
        bottom: 2,
        left: 2,
      });
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Set only the top padding of the red element to 3',
    test: () => {
      red.setPadding({
        top: 3,
      });
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Remove the padding of the red element',
    test: () => {
      red.setPadding(noPadding);
      buffer.render();

      return { buffer };
    },
  },
];
