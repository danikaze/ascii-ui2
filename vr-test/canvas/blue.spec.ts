import { assert } from 'chai';
import { TestCases } from '@test';

export const data: TestCases = [
  {
    description: 'Should resize the canvas to a squared one',
    test: ({ canvas }) => {
      canvas.height = canvas.width;
    },
    afterTest: async ({ canvasHandler }) => {
      const { width, height } = await canvasHandler.evaluate(canvas => {
        return {
          width: canvas.width,
          height: canvas.height,
        };
      });
      assert.equal(width, height, 'canvas should be square');
    },
  },
  {
    description: 'Should render a blue square over transparent background',
    test: ({ canvas }) => {
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'blue';
      // tslint:disable-next-line: no-magic-numbers
      ctx.fillRect(80, 80, 50, 50);
      // tslint:disable-next-line: no-any
      (window as any).abc[0] = 'foobar';
    },
  },
];
