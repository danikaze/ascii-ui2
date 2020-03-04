// tslint:disable: no-magic-numbers
import { TestCases } from '@test';
import { Buffer } from '@src/buffer';
import { Text } from '@src/widgets/text';
import {
  TextVerticalAlignment,
  TextHorizontalAlignment,
} from '@src/util/parse-text';

let buffer: Buffer;
let widget: Text;

function resetBuffer(canvas: HTMLCanvasElement) {
  buffer?.clearInputEventListeners();
  buffer = new Buffer({
    canvas,
    cols: 10,
    rows: 5,
  });
}

function resetWidget(
  vAlign: TextVerticalAlignment,
  hAlign: TextHorizontalAlignment
) {
  const text = 'Line 1\nLine n.2\n3rd';
  buffer.remove(widget);
  widget = new Text({
    text,
    vAlign,
    hAlign,
    x: 0,
    y: 0,
    width: buffer.width,
    height: buffer.height,
  });
  buffer.append(widget);
}

export const data: TestCases = [];

// generate all align cases (3x3)
const vAligns: TextVerticalAlignment[] = ['top', 'center', 'bottom'];
const hAligns: TextHorizontalAlignment[] = ['left', 'center', 'right'];
for (const vAlign of vAligns) {
  for (const hAlign of hAligns) {
    data.push({
      description: `Align: ${vAlign}-${hAlign}`,
      test: ({ canvas }) => {
        resetBuffer(canvas);
        resetWidget(vAlign, hAlign);

        buffer.render();
        return { buffer };
      },
    });
  }
}
