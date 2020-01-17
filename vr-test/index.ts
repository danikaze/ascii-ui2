export interface TestData {
  canvas: HTMLCanvasElement;
}
export type TestFunction = (data: TestData) => void | Promise<void>;
export type TestCases = TestFunction | TestFunction[];
