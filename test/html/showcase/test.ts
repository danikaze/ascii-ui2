import * as FontFaceObserver from 'fontfaceobserver';
import { Buffer } from '@src/buffer';
import {
  TestCases,
  BrowserTestData,
  BrowserTestFunctionReturnData,
} from '../../';
import { LoadTestOptions } from '..';
import { setActiveTest } from './sidebar';
import { initProgressBar, updateProgressBar, setError } from './progress';

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
export async function loadTest<R extends {}>(
  testCase: string,
  options: LoadTestOptions = { step: 'all' }
): Promise<BrowserTestFunctionReturnData<R> | void> {
  /*
   * 1. test loading
   */
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
    return;
  }

  // tslint:disable: no-magic-numbers
  Buffer.defaultOptions.tileWidth = 11;
  Buffer.defaultOptions.tileHeight = 22;
  Buffer.defaultOptions.clearStyle.offsetX = 0;
  Buffer.defaultOptions.clearStyle.offsetY = 0;
  Buffer.defaultOptions.clearStyle.font = '22px Fixedsys';

  const font = new FontFaceObserver('Fixedsys');
  return font.load().then(() => executeTest(testCase, options, testName, data));
}

async function executeTest<R extends {}>(
  testCase: string,
  options: LoadTestOptions = { step: 'all' },
  testName: string,
  data: TestCases
): Promise<BrowserTestFunctionReturnData<R> | void> {
  /*
   * 2. test preparation
   */
  const nSteps = data.length;
  const { step } = options as Required<LoadTestOptions>;
  let canvas = document.querySelector<HTMLCanvasElement>('#test canvas')!;

  // select the active element in the index
  setActiveTest(testName);

  // set the title
  document.getElementById('test-case-name')!.innerText = testName;

  // set the progress bar
  if (currentTestCase !== testCase) {
    initProgressBar(testCase, nSteps);
  }
  currentTestCase = testCase;

  // resizing the canvas will reset it
  if (step === 'all' || step <= 0 || step >= nSteps) {
    canvas = document.querySelector<HTMLCanvasElement>('#test canvas')!;
    // create a new canvas just to get the default size ^^;
    const temp = document.createElement('canvas');
    canvas.width = temp.width;
    canvas.height = temp.height;
  }

  /*
   * 3. test execution
   */
  const testData = { canvas };

  // run all steps
  if (step === 'all') {
    let returnData: BrowserTestFunctionReturnData | void;
    for (let s = 0; s < data.length; s++) {
      returnData = await executeStep(data, s, testData);
    }
    return returnData;
  }

  // run only one step
  if (step < 0 || step >= data.length) {
    return;
  }
  return await executeStep(data, step, testData);
}

/**
 * Execute only one step of a specific test case
 */
async function executeStep<R>(
  tests: TestCases,
  step: number,
  data: BrowserTestData
): Promise<BrowserTestFunctionReturnData<R> | void> {
  const testCase = tests[step];
  const errorsElem = document.getElementById('errors')!;
  document.getElementById('description')!.innerText =
    testCase.description || '';
  updateProgressBar(step);

  try {
    errorsElem.style.display = 'none';
    const testResult = await testCase.test(data);
    // test only cares about the matrix content of the buffer
    // and actually, not stripping the buffer, might cause errors
    // when stringifying the data to return from puppeteer because of
    // cyclical references
    return ({
      ...testResult,
      buffer: {
        // tslint:disable-next-line: no-any
        matrix: (testResult.buffer as any).matrix,
      },
    } as unknown) as BrowserTestFunctionReturnData;
  } catch (error) {
    setError(step);
    errorsElem.style.display = '';
    errorsElem.innerHTML = `<pre>${error.toString()}</pre>`;
    // tslint:disable-next-line: no-console
    console.error(error);
  }
}
