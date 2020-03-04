// tslint:disable: no-magic-numbers
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
    rows: 5,
  });
}

const scrollableText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vitae erat ac turpis suscipit consequat. Vivamus finibus, arcu sed varius tincidunt, dui magna dictum enim, id ullamcorper dolor mauris sed massa.\\nSed sollicitudin lorem ut magna tristique porttitor non sed arcu. Sed gravida libero purus, nec scelerisque orci faucibus eget.\\nMauris lobortis erat diam, et feugiat tellus aliquam et.\\nProin imperdiet sodales turpis quis volutpat. Sed ut egestas purus. Vestibulum a iaculis tellus, eget dictum felis. Mauris cursus et arcu malesuada condimentum. Vestibulum id scelerisque urna. Nam nec ex dictum urna efficitur blandit sit amet in ipsum.';

export const data: TestCases = [
  {
    description: 'Scrollable text with default settings',
    test: ({ canvas }) => {
      resetBuffer(canvas);
      widget = new Text({
        text: scrollableText,
        x: 0,
        y: 0,
        width: buffer.width,
        height: buffer.height,
      });

      buffer.append(widget);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll one line down',
    test: () => {
      widget.scroll(0, 1);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll one page down',
    test: () => {
      widget.scrollPages(0, 1);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll to the end (without allowing empty lines at the end)',
    test: () => {
      widget.scrollTo(0, '100%');
      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Reset the widget (allowing empty lines at the end when scrolling) and with vertical scroll ellipsis',
    test: () => {
      buffer.remove(widget);
      widget = new Text({
        text: scrollableText,
        x: 0,
        y: 0,
        width: buffer.width,
        height: buffer.height,
        allowEmptyScrollLines: true,
        vOverflow: 'ellipsis',
      });

      buffer.append(widget);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll one page (allowing empty lines at the end)',
    test: () => {
      widget.scrollPages(0, 1);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll to the end (allowing empty lines at the end)',
    test: () => {
      widget.scrollTo(0, '100%');
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll to the first line',
    test: () => {
      widget.scrollTo(0, 0);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Widget reset to allow horizontal scroll (with line ellipsis)',
    test: () => {
      buffer.remove(widget);
      widget = new Text({
        text: scrollableText,
        x: 0,
        y: 0,
        width: buffer.width,
        height: buffer.height,
        hOverflow: 'ellipsis',
      });
      buffer.append(widget);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll one column to the right',
    test: () => {
      widget.scrollTo(1, 0);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll one page to the right',
    test: () => {
      widget.scrollPages(1, 0);
      buffer.render();

      return { buffer };
    },
  },
  {
    description:
      'Scroll to the right to a place where some lines are completed, and others still have more content',
    test: () => {
      widget.scrollTo(123, 0);
      buffer.render();

      return { buffer };
    },
  },
  {
    description: 'Scroll to the top right',
    test: () => {
      widget.scrollTo('100%', 0);
      buffer.render();

      return { buffer };
    },
  },
];
