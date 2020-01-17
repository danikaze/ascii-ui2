import { LoadTestOptions } from '..';
import { setActiveTest } from './sidebar';

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
  options: LoadTestOptions = {}
): Promise<boolean> {
  let data;
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

  // select the active element in the index
  setActiveTest(testName);

  // set the title
  document.getElementById('test-case-name')!.innerText = testName;

  const { step } = options;
  let canvas = document.querySelector('#test canvas');

  // replace the canvas by a new one to ensure resetting it
  if (!canvas || step === undefined || step <= 0) {
    canvas = document.createElement('canvas');
    const container = document.getElementById('test')!;
    container.innerHTML = '';
    container.append(canvas);
  }

  // execute tests
  const testData = { canvas };

  // run only one step
  if (step !== undefined) {
    // only one step available
    if (!Array.isArray(data)) {
      if (step !== 0) {
        return false;
      }
      await data(testData);
      return true;
    }
    // list of steps available
    if (step < 0 || step >= data.length) {
      return false;
    }
    await data[step](testData);
    return true;
  }

  // all steps
  if (!Array.isArray(data)) {
    await data(testData);
  } else {
    for (const fn of data) {
      await fn(testData);
    }
  }
  return true;
}
