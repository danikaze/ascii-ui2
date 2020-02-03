// tslint:disable: no-magic-numbers
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Element } from '@src/element';
import { createBox } from './utils';

let buffer: Buffer;
let red: Element;
let green: Element;
let grey: Element;

export const data: TestCases = [
  {
    description: 'Elements can be created directly disabled',
    test: async ({ canvas }) => {
      buffer = new Buffer({ canvas, cols: 6, rows: 3 });

      red = createBox('red', 0, 0, 2, 3);
      green = createBox('green', 2, 0, 2, 3);
      grey = createBox('grey', 4, 0, 2, 3, { disabled: true });

      buffer.append(red);
      buffer.append(green);
      buffer.append(grey);

      green.focus();

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Disabled elements cannot be focused',
    test: async () => {
      green.disable();
      grey.focus();

      buffer.render();

      return { buffer };
    },
  },
  {
    description: `Enabling a previously focused element doesn't return the focus`,
    test: async () => {
      green.enable();

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Disabled elements can still be modified',
    test: async () => {
      buffer.remove(green);
      grey.setPosition(0, 0);
      grey.resize(6, 3);
      grey.append(red);
      red.setPosition(1, 1);
      red.resize(4, 1);

      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Disabled property is not propagated to children (can be focused)',
    test: async () => {
      red.focus();

      buffer.render();

      return { buffer };
    },
  },
];
