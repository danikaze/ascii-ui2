// tslint:disable: no-magic-numbers
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Box } from '@src/widgets/box';

let buffer: Buffer;
let box: Box;
let innerBox: Box;

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
    description: 'Nested Box rendering',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      box = new Box({
        x: 1,
        y: 1,
        width: 10,
        height: 7,
        styles: { bg: 'blue' },
      });
      innerBox = new Box({
        x: 1,
        y: 1,
        width: 3,
        height: 3,
      });

      box.append(innerBox);
      buffer.append(box);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Focused Box rendering',
    test: () => {
      box.focus();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Inner box focused rendering',
    test: () => {
      innerBox.focus();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Blur and positioning',
    test: () => {
      innerBox.blur();
      innerBox.move(1, 2);
      innerBox.setWidth(innerBox.getWidth() + 1);
      buffer.render();

      return { buffer };
    },
  },
];
