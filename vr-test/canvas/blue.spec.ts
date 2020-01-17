import { TestCases } from '..';

export const data: TestCases = [
  ({ canvas }) => {
    const ctx = canvas.getContext('2d')!;
    canvas.height = canvas.width;
    ctx.fillStyle = 'blue';
    // tslint:disable-next-line: no-magic-numbers
    ctx.fillRect(50, 50, 50, 50);
  },
];
