// tslint:disable: no-magic-numbers
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Box } from '@src/widgets/box';

let buffer: Buffer;
let boxNoLabel: Box;
let boxLeft: Box;
let boxCenter: Box;
let boxRight: Box;

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
    description: 'Default labeling (centered one is focused)',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      boxNoLabel = new Box({
        x: 1,
        y: 1,
        width: 14,
        height: 2,
      });
      boxLeft = new Box({
        x: 1,
        y: 3,
        width: 14,
        height: 2,
        label: 'Left',
      });
      boxCenter = new Box({
        x: 1,
        y: 5,
        width: 14,
        height: 2,
        label: 'Center',
        labelAlign: 'center',
      });
      boxRight = new Box({
        x: 1,
        y: 7,
        width: 14,
        height: 2,
        label: 'Right',
        labelAlign: 'right',
      });

      boxCenter.focus();

      buffer.append(boxNoLabel);
      buffer.append(boxLeft);
      buffer.append(boxCenter);
      buffer.append(boxRight);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Padding label (left: 1, right: 2)',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      const labelPadding = { left: 1, right: 2 };

      boxNoLabel = new Box({
        labelPadding,
        x: 1,
        y: 1,
        width: 14,
        height: 2,
      });
      boxLeft = new Box({
        labelPadding,
        x: 1,
        y: 3,
        width: 14,
        height: 2,
        label: 'Left',
      });
      boxCenter = new Box({
        labelPadding,
        x: 1,
        y: 5,
        width: 14,
        height: 2,
        label: 'Center',
        labelAlign: 'center',
      });
      boxRight = new Box({
        labelPadding,
        x: 1,
        y: 7,
        width: 14,
        height: 2,
        label: 'Right',
        labelAlign: 'right',
      });

      boxCenter.focus();

      buffer.append(boxNoLabel);
      buffer.append(boxLeft);
      buffer.append(boxCenter);
      buffer.append(boxRight);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Long label',
    test: ({ canvas }) => {
      resetBuffer(canvas);

      boxNoLabel = new Box({
        x: 1,
        y: 1,
        width: 2,
        height: 2,
        label: 'Not even ellipsis should be shown in this case',
      });
      boxLeft = new Box({
        x: 1,
        y: 3,
        width: 14,
        height: 2,
        label: 'Left-aligned label',
      });
      boxCenter = new Box({
        x: 1,
        y: 5,
        width: 14,
        height: 2,
        label: 'Center-aligned label',
        labelAlign: 'center',
      });
      boxRight = new Box({
        x: 1,
        y: 7,
        width: 14,
        height: 2,
        label: 'Right-aligned label',
        labelAlign: 'right',
      });

      boxCenter.focus();

      buffer.append(boxNoLabel);
      buffer.append(boxLeft);
      buffer.append(boxCenter);
      buffer.append(boxRight);
      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Label change (from the previous ones). Left one is set to empty string. Center one is set to undefined. Right one is set to "Right"',
    test: () => {
      boxLeft.setLabel('');
      boxCenter.setLabel(undefined);
      boxRight.setLabel('Right');

      buffer.render();

      return { buffer };
    },
  },
];
