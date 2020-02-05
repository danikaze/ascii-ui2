import { BrowserTestFunctionReturnData } from '@test';
import { Buffer } from '@src/buffer';
import { initSidebar } from './showcase/sidebar';
import { loadTest, resetCanvas } from './showcase/test';
import { initFilter } from './showcase/filter';
import { registerShortcuts } from './showcase/shortcuts';

export interface LoadTestOptions {
  step?: number | 'all' | 'none';
}

export interface TestWindow extends Window {
  loadTest: <R extends {} = {}>(
    testCase: string,
    options?: LoadTestOptions
  ) => Promise<BrowserTestFunctionReturnData<R> | void>;
  resetCanvas: () => void;
  canvas: HTMLCanvasElement;
  buffer: Buffer;
}

export function initPage() {
  initSidebar();
  initFilter();
  registerShortcuts();

  // load initial test case, if any
  const initialUrl = new URL(location.href);
  const testCase = initialUrl.searchParams.get('case');
  if (testCase) {
    loadTest(testCase);
  }

  // load test case when history.back
  window.addEventListener('popstate', ({ state }) => {
    loadTest(state);
  });

  ((window as unknown) as TestWindow).loadTest = loadTest;
  ((window as unknown) as TestWindow).resetCanvas = resetCanvas;
}

initPage();
