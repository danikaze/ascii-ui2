export interface TestData {
  canvas: HTMLCanvasElement;
}
export type TestDescription = {
  description?: string;
  fn: TestFunction;
};
export type TestFunction = (data: TestData) => void | Promise<void>;
export type TestCases = TestDescription[];
