import { initSidebar } from './showcase/sidebar';
import { loadTest } from './showcase/test';
import { initFilter } from './showcase/filter';

export interface LoadTestOptions {
  step?: number;
}

export interface TestWindow extends Window {
  loadTest: (testCase: string, options?: LoadTestOptions) => Promise<boolean>;
}

export function initPage() {
  initSidebar();
  initFilter();

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
}

initPage();
