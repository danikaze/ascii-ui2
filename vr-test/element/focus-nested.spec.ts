import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Element } from '@src/element';
import { createBox } from './utils';

let buffer: Buffer;
let e1: Element;
let e11: Element;
let e12: Element;
let e13: Element;
let e14: Element;
let e141: Element;
let e142: Element;
let e2: Element;
let e21: Element;
let e211: Element;
let e2111: Element;

async function focusNext() {
  buffer.focusNext();
  buffer.render();

  return { buffer };
}

export const data: TestCases = [
  {
    description: 'No element is focused at the beginning',
    test: async ({ canvas }) => {
      // tslint:disable: no-magic-numbers
      buffer = new Buffer({ canvas, cols: 8, rows: 10 });

      e1 = createBox('red', 0, 0, 8, 5, { focusable: true });
      e11 = createBox('yellow', 1, 1, 1, 1, { focusable: true });
      e12 = createBox('yellow', 1, 2, 1, 1, { focusable: true });
      e13 = createBox('yellow', 1, 3, 1, 1, { focusable: true });
      e14 = createBox('orange', 3, 1, 4, 3, { focusable: true });
      e141 = createBox('lightblue', 1, 1, 1, 1, { focusable: true });
      e142 = createBox('lightblue', 2, 1, 1, 1, { focusable: true });
      // parent already appended before appending the children
      buffer.append(e1);
      // prepending instead of appending:
      // iterations should be done respecting the order of the elements, not their insertion
      e1.prepend(e14);
      e1.prepend(e13);
      e1.prepend(e12);
      e1.prepend(e11);
      e14.prepend(e142);
      e14.prepend(e141);

      e2 = createBox('#030', 0, 5, 8, 5, { focusable: true });
      e21 = createBox('#070', 1, 1, 6, 3, { focusable: false });
      e211 = createBox('#0a0', 1, 1, 4, 1, { focusable: true });
      e2111 = createBox('#0d0', 1, 0, 2, 1, { focusable: true });
      // appending the children before attaching it to its parents
      e211.append(e2111);
      e21.append(e211);
      e2.append(e21);
      buffer.append(e2);

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Next element: red.',
    test: focusNext,
  },
  {
    description: 'Next element: red > yellow top',
    test: focusNext,
  },
  {
    description: 'Next element: red > yellow middle',
    test: focusNext,
  },
  {
    description: 'Next element: red > yellow bottom',
    test: focusNext,
  },
  {
    description: 'Next element: orange',
    test: focusNext,
  },
  {
    description: 'Next element: orange > lightblue left',
    test: focusNext,
  },
  {
    description: 'Next element: orange > lightblue right',
    test: focusNext,
  },
  {
    description: 'Next element: outer green',
    test: focusNext,
  },
  {
    description:
      'Next element: outer green > middle green (not focusable) > inner green',
    test: focusNext,
  },
  {
    description:
      'Next element: outer green > middle green (not focusable) > inner green > central one',
    test: focusNext,
  },
  {
    description: 'Next element: go back to the first one (red)',
    test: focusNext,
  },
];
