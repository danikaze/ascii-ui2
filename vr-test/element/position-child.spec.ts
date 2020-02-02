// tslint:disable: no-magic-numbers
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Container, ColorBox } from './utils';

let buffer: Buffer;
let container: Container;
let red: ColorBox;
let yellow: ColorBox;
let green: ColorBox;

function resetBuffer(canvas: HTMLCanvasElement) {
  buffer?.clearInputEventListeners();
  buffer = new Buffer({
    canvas,
    cols: 16,
    rows: 6,
  });
}

export const data: TestCases = [
  {
    description: 'Empty parent should be rendered as usual',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      container = new Container('grey', {
        x: 1,
        y: 1,
        width: buffer.width - 2,
        height: buffer.height - 2,
      });
      buffer.append(container);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Should autoposition one child',
    test: () => {
      yellow = new ColorBox('yellow', {});
      container.append(yellow);

      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Should reposition the children when adding a 2nd one (hidden, so the first one being resized can be seen properly)',
    test: () => {
      red = new ColorBox('red', {});
      container.append(red);
      red.hide();

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Should reposition the children when resizing the container',
    test: () => {
      container.resize(container.getWidth() - 1, container.getHeight() - 1);

      red.show();
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Should reposition the children when adding a 3rd one',
    test: () => {
      green = new ColorBox('green', {});
      container.append(green);

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Should reposition the children when resizing the container',
    test: () => {
      container.resize(container.getWidth() + 1, container.getHeight() + 1);

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Should reposition the children when removing a children',
    test: () => {
      container.remove(red);

      buffer.render();

      return { buffer };
    },
  },
];
