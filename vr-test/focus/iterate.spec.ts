import { TestCases } from '@test';
import { FocusManager } from '@src/focus-manager';
import { createBox } from './utils';
import { Element } from '@src/element';

let buffer: FocusManager;
let red: Element;
let green: Element;
let grey: Element;
let yellow: Element;

async function focusNext() {
  buffer.focusNext();
  buffer.render();

  return { buffer };
}

async function focusPrev() {
  buffer.focusPrev();
  buffer.render();

  return { buffer };
}

export const data: TestCases = [
  {
    description: 'No element is focused at the beginning',
    test: async ({ canvas }) => {
      // tslint:disable: no-magic-numbers
      buffer = new FocusManager({ canvas, cols: 4, rows: 4 });

      red = createBox('red', 0, 0, true);
      green = createBox('green', 2, 0, true);
      grey = createBox('grey', 0, 2, false);
      yellow = createBox('yellow', 2, 2, true);

      buffer.append(red);
      buffer.append(green);
      buffer.append(grey);
      buffer.append(yellow);
      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Focusing the next element with nothing focused should focus the first one.',
    test: focusNext,
  },
  {
    description:
      'Focusing the previous element with nothing focused should focus the last one.',
    test: async () => {
      buffer.getFocusedElement()!.blur();
      return focusPrev();
    },
  },
  {
    description:
      'Focusing the next element from the last one should loop to the first one.',
    test: focusNext,
  },
  {
    description:
      'Focusing the previous element from the first one should loop to the last one.',
    test: focusPrev,
  },
  {
    description:
      'Previous element. The green one should be focused because the grey is not focusable',
    test: focusPrev,
  },
  {
    description: 'Previous element. The red one should be focused',
    test: focusPrev,
  },
  {
    description: 'Next element. The green one should be focused',
    test: focusNext,
  },
  {
    description:
      'Next element. The yellow one should be focused because the grey is not focusable',
    test: focusNext,
  },
];
