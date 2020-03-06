// tslint:disable: no-magic-numbers
import { assert } from 'chai';
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Text } from '@src/widgets/text';

let buffer: Buffer;
let widget: Text;

function resetBuffer(canvas: HTMLCanvasElement) {
  buffer?.clearInputEventListeners();
  buffer = new Buffer({
    canvas,
    cols: 10,
    rows: 3,
  });
}

export const data: TestCases = [
  {
    description: 'Basic Text with a size equal to the buffer',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      const text = 'This is a very basic text';

      widget = new Text({
        text,
        x: 0,
        y: 0,
        width: buffer.width,
        height: buffer.height,
      });

      buffer.append(widget);
      buffer.render();

      assert.equal(widget.getText(), text);

      return { buffer };
    },
  },
  {
    description:
      'Text should re-shape after resizing the widget (to the buffer size)',
    test: () => {
      buffer.resize(15, 5);
      widget.resize(15, 5);
      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Text should re-shape after resizing and moving the widget (without resizing the buffer)',
    test: () => {
      widget.move(1, 1);
      widget.resize(10, 5);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Widget should allow to update the content',
    test: () => {
      const updatedText = 'Updated text value ^_^';
      widget.setText(updatedText);
      buffer.render();

      assert.equal(widget.getText(), updatedText);

      return { buffer };
    },
  },
];
