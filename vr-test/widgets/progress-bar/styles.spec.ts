// tslint:disable: no-magic-numbers
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { ProgressBar, ProgressBarOptions } from '@src/widgets/progress-bar';
import { emptyProgressBarStyles } from '@src/widgets/progress-bar/constants';

let buffer: Buffer;
let bar1: ProgressBar;
let bar2: ProgressBar;
let bar3: ProgressBar;
let bar4: ProgressBar;
let bar5: ProgressBar;
let bar6: ProgressBar;

function resetBuffer(canvas: HTMLCanvasElement) {
  buffer?.clearInputEventListeners();
  buffer = new Buffer({
    canvas,
    cols: 17,
    rows: 7,
  });
}

function createBars(options?: ProgressBarOptions) {
  bar1 = new ProgressBar({
    x: 1,
    y: 1,
    width: 9,
    progress: 0,
    ...options,
  });
  bar2 = new ProgressBar({
    x: 1,
    y: 3,
    width: 9,
    progress: 0.5,
    ...options,
  });
  bar3 = new ProgressBar({
    x: 1,
    y: 5,
    width: 9,
    progress: 1,
    ...options,
  });
  bar4 = new ProgressBar({
    x: 11,
    y: 1,
    height: 5,
    type: 'vertical',
    progress: 0,
    ...options,
  });
  bar5 = new ProgressBar({
    x: 13,
    y: 1,
    height: 5,
    type: 'vertical',
    progress: 0.5,
    ...options,
  });
  bar6 = new ProgressBar({
    x: 15,
    y: 1,
    height: 5,
    type: 'vertical',
    progress: 1,
    ...options,
  });

  buffer.append(bar1);
  buffer.append(bar2);
  buffer.append(bar3);
  buffer.append(bar4);
  buffer.append(bar5);
  buffer.append(bar6);
}

export const data: TestCases = [
  {
    description: 'Default ProgressBars (0%, 50%, 100%)',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      createBars();

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Hollow styled ProgressBars (0%, 50%, 100%)',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      createBars({
        styles: emptyProgressBarStyles,
        drawActiveOnEmpty: true,
        drawActiveOnFull: true,
      });

      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Custom styled ProgressBars (0%, 50%, 100%)',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      createBars({
        styles: {
          active: { char: '@', fg: 'white', bg: 'red' },
          done: { char: 'X', fg: 'orange', bg: 'yellow' },
          pending: { char: '.', fg: 'white', bg: 'green' },
        },
        drawActiveOnEmpty: true,
        drawActiveOnFull: true,
      });

      buffer.render();

      return { buffer };
    },
  },
];
