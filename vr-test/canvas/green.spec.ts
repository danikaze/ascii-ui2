import { TestCases } from '@test';

export const data: TestCases = [
  {
    description: 'Should render a green square over transparent background',
    fn: ({ canvas }) => {
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'green';
      // tslint:disable-next-line: no-magic-numbers
      ctx.fillRect(50, 50, 50, 50);
    },
  },
];
