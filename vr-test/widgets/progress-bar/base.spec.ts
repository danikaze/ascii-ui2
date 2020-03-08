// tslint:disable: no-magic-numbers
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { ProgressBar } from '@src/widgets/progress-bar';

let buffer: Buffer;
let bar1: ProgressBar;
let bar2: ProgressBar;
let bar3: ProgressBar;
let bar4: ProgressBar;
let bar5: ProgressBar;

function resetBuffer(canvas: HTMLCanvasElement) {
  buffer?.clearInputEventListeners();
  buffer = new Buffer({
    canvas,
    cols: 20,
    rows: 11,
  });
}

export const data: TestCases = [
  {
    description: 'Basic ProgressBars (0%, 1%, 50%, 99%, 100%)',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      bar1 = new ProgressBar({
        y: 1,
        width: buffer.width,
      });
      bar2 = new ProgressBar({
        y: 3,
        width: buffer.width,
        progress: 0.01,
      });
      bar3 = new ProgressBar({
        y: 5,
        width: buffer.width,
        progress: 0.5,
      });
      bar4 = new ProgressBar({
        y: 7,
        width: buffer.width,
        progress: 0.99,
      });
      bar5 = new ProgressBar({
        y: 9,
        width: buffer.width,
        progress: 1,
      });

      buffer.append(bar1);
      buffer.append(bar2);
      buffer.append(bar3);
      buffer.append(bar4);
      buffer.append(bar5);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Advance each bar progress 5%',
    test: () => {
      bar1.addProgress(0.05);
      bar2.addProgress(0.05);
      bar3.addProgress(0.05);
      bar4.addProgress(0.05);
      bar5.addProgress(0.05);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Basic vertical ProgressBars (0%, 1%, 50%, 99%, 100%)',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      bar1 = new ProgressBar({
        x: 1,
        height: buffer.height,
        type: 'vertical',
      });
      bar2 = new ProgressBar({
        x: 3,
        height: buffer.height,
        progress: 0.01,
        type: 'vertical',
      });
      bar3 = new ProgressBar({
        x: 5,
        height: buffer.height,
        progress: 0.5,
        type: 'vertical',
      });
      bar4 = new ProgressBar({
        x: 7,
        height: buffer.height,
        progress: 0.99,
        type: 'vertical',
      });
      bar5 = new ProgressBar({
        x: 9,
        height: buffer.height,
        progress: 1,
        type: 'vertical',
      });

      buffer.append(bar1);
      buffer.append(bar2);
      buffer.append(bar3);
      buffer.append(bar4);
      buffer.append(bar5);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Advance each bar progress 19%',
    test: () => {
      bar1.addProgress(0.19);
      bar2.addProgress(0.19);
      bar3.addProgress(0.19);
      bar4.addProgress(0.19);
      bar5.addProgress(0.19);
      buffer.render();

      return { buffer };
    },
  },
];
