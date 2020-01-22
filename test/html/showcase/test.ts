import { TestCases } from '../../';
import { LoadTestOptions } from '..';
import { setActiveTest } from './sidebar';
import { initProgressBar, updateProgressBar } from './progress';

let currentTestCase = '';

/**
 * This function:
 * - Reset the page for a new test (if step is <= 0)
 * - If no `step` is specified, run all of them
 * - If a `step` is specified, run only that one
 *
 * Returns `false` if the specified step didn't exist, `true` if it was executed.
 * Even if the step doesn't exist, it will prepare the page
 */
export async function loadTest(
  testCase: string,
  options: LoadTestOptions = { step: 'all' }
): Promise<boolean> {
  let data: TestCases;
  const testName = testCase.replace(/\\/g, '/');
  try {
    const mod = require(`../../../vr-test/${testName}.spec`);
    data = mod.data;
    if (!data) {
      throw new Error();
    }
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.warn(`data not found for test "${testName}"`);
    return false;
  }

  const nSteps = data.length;
  const { step } = options as Required<LoadTestOptions>;
  let canvas = document.querySelector<HTMLCanvasElement>('#test canvas');

  // select the active element in the index
  setActiveTest(testName);

  // set the title
  document.getElementById('test-case-name')!.innerText = testName;

  // set the progress bar
  if (currentTestCase !== testCase) {
    initProgressBar(testCase, nSteps);
  }
  currentTestCase = testCase;

  // replace the canvas by a new one to ensure resetting it
  if (!canvas || step === 'all' || step <= 0 || step >= nSteps) {
    canvas = document.createElement('canvas');
    const container = document.getElementById('test')!;
    container.innerHTML = '';
    container.append(canvas);
  }

  // execute tests
  const testData = { canvas };

  // run all steps
  if (step === 'all') {
    for (let s = 0; s < data.length; s++) {
      const test = data[s];
      document.getElementById('description')!.innerText =
        test.description || '';
      updateProgressBar(s);
      await test.fn(testData);
    }
    return true;
  }

  // run only one step
  if (step < 0 || step >= data.length) {
    return false;
  }
  const test = data[step];
  document.getElementById('description')!.innerText = test.description || '';
  updateProgressBar(step);
  await test.fn(testData);
  return true;
}
