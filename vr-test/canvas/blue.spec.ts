import { TestCases } from '..';

export const data: TestCases = [
  ({ canvas }) => {
    canvas.height = canvas.width;
  },
  ({ canvas }) => {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'blue';
    // tslint:disable-next-line: no-magic-numbers
    ctx.fillRect(50, 50, 50, 50);
  },
];
