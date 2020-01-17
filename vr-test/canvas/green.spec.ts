import { TestCases } from '..';

export const data: TestCases = [
  ({ canvas }) => {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'green';
    // tslint:disable-next-line: no-magic-numbers
    ctx.fillRect(50, 50, 50, 50);
  },
];
