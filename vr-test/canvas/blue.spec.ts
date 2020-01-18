import { TestCases } from '..';

export const data: TestCases = [
  {
    description: 'Should resize the canvas to a squared one',
    fn: ({ canvas }) => {
      canvas.height = canvas.width;
    },
  },
  {
    description: 'Should render a blue square over transparent background',
    fn: ({ canvas }) => {
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'blue';
      // tslint:disable-next-line: no-magic-numbers
      ctx.fillRect(80, 80, 50, 50);
    },
  },
];
