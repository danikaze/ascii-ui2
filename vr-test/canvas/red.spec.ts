import { TestCases } from '@test';

export const data: TestCases = [
  {
    description: 'Should render a red square over white background',
    test: ({ canvas }) => {
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'red';
      // tslint:disable-next-line: no-magic-numbers
      ctx.fillRect(10, 10, 50, 50);
    },
  },
];
