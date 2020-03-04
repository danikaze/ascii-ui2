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
    cols: 15,
    rows: 5,
  });
}

export const data: TestCases = [
  {
    description: 'Basic formatting in the content of the Text',
    test: ({ canvas }) => {
      const text = 'Basic text line.\nThis is a new line.\\nAnother line :)';
      resetBuffer(canvas);

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
    description: 'Allow showing the escape character',
    test: () => {
      const text = 'Not a line break (\\\\n) with escaped text';
      widget.setText('Not a line break (\\\\n) with escaped text');
      buffer.render();

      assert.equal(widget.getText(), text);

      return { buffer };
    },
  },
  {
    description: 'Color formatting',
    test: () => {
      const text =
        'Default {fg:red}Red FG{/fg:red} {bg:blue}Blue BG{/bg:blue} {bg:green}{fg:yellow}Green and yellow{/fg:yellow}{/bg:green}';
      widget.setText(text);
      buffer.render();

      assert.equal(widget.getText(), text);

      return { buffer };
    },
  },
];
