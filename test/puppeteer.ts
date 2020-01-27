import * as puppeteer from 'puppeteer';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Buffer } from '@src/buffer';
import { relative } from 'path';
import { sync as rimraf } from 'rimraf';
import { assert } from 'chai';
import { sync as mkdirp } from 'mkdirp';
import {
  TestCases,
  PuppeteerTestData,
  BrowserTestFunctionReturnData,
  PuppeteerAfterTestData,
} from '@test';
import { compareImgs } from './compare-imgs';
import { TestWindow } from './html';
import { VR_TEST_FOLDER } from './utils';

export interface VrTestOptions {
  testCase: string;
  steps: TestCases;
  page: puppeteer.Page;
  preserveImages: boolean;
  expectedFolderPath: string;
  execFolderPath: string;
  getFilename: (
    type: 'data' | 'expected' | 'diff' | 'exec',
    step: number,
    ext: 'png' | 'json'
  ) => string;
  noImageTest?: boolean;
  noDataTest?: boolean;
}

interface PrivateBuffer {
  matrix: { [h: number]: { [w: number]: undefined } };
}

/**
 * Run a battery of Visual Regression Tests
 * Accepts a list of functions. After each function, it will take a screenshot of the provided canvas
 * If the test is new, it will just store the image as a reference for future testing
 * If the test expected result exists, it will compare the current execution result and perform
 * a pixel difference to check if the test execution is correct
 */
export async function runVrTest({
  testCase,
  steps,
  page,
  preserveImages,
  expectedFolderPath,
  execFolderPath,
  getFilename,
  noImageTest,
  noDataTest,
}: VrTestOptions): Promise<void> {
  if (!existsSync(expectedFolderPath)) {
    mkdirp(expectedFolderPath);
  }
  if (!existsSync(execFolderPath)) {
    mkdirp(execFolderPath);
  }

  let allOk = true;

  const puppeteerTestData: PuppeteerTestData = {
    page,
    canvasHandler: await getPageCanvasHandler(page),
    getBounds: async elem => {
      const data = await elem.evaluate(elem => {
        return JSON.stringify(elem.getBoundingClientRect());
      });
      return JSON.parse(data);
    },
  };

  // execute all the test steps of the test case
  for (let s = 0; s < steps.length; s++) {
    const { beforeTest, afterTest } = steps[s];

    // pre-test, in puppeteer side
    if (beforeTest) {
      await beforeTest(puppeteerTestData);
    }

    // test, in browser side
    const testResult = (await page.evaluate(
      async (testCase, step) => {
        return await ((window as unknown) as TestWindow).loadTest(testCase, {
          step,
        });
      },
      testCase,
      s
    )) as BrowserTestFunctionReturnData;

    if (!testResult || !testResult.buffer) {
      const description = steps[s].description
        ? `(${steps[s].description})`
        : '';
      throw new Error(
        `Test case not returning the buffer: ${testCase}:${s} ${description}`
      );
    }

    allOk =
      allOk &&
      (await checkBrowserStatus(
        page,
        testResult.buffer,
        s,
        getFilename,
        noImageTest,
        noDataTest
      ));

    // tests shouldn't modify the canvas element
    const canvasBeforeTest = puppeteerTestData.canvasHandler;
    const canvasAfterTest = await getPageCanvasHandler(page);
    const hasCanvasChanged = await page.evaluate(
      (c1, c2) => c1 !== c2,
      canvasBeforeTest,
      canvasAfterTest
    );
    if (hasCanvasChanged) {
      throw new Error(`test canvas was modified by ${testCase} at step ${s}`);
    }

    // post-test, in puppeteer side
    if (afterTest) {
      await afterTest({
        ...puppeteerTestData,
        data: testResult.data,
      } as PuppeteerAfterTestData);
    }
  }

  if (allOk && !preserveImages) {
    rimraf(execFolderPath);
  }
}

/**
 * Return a JsHandler for the page <canvas> element
 */
async function getPageCanvasHandler(
  page: puppeteer.Page
): Promise<puppeteer.JSHandle<HTMLCanvasElement>> {
  return page.evaluateHandle(() => document.querySelector('#test canvas'));
}

/**
 * Check in the browser if the result of an step is the expected one.
 * If there's nothing expected, save the current result as the expected for future tests
 */
async function checkBrowserStatus(
  page: puppeteer.Page,
  buffer: Buffer,
  step: number,
  getFilename: (
    type: 'data' | 'expected' | 'diff' | 'exec',
    step: number,
    ext: 'png' | 'json'
  ) => string,
  noImageTest?: boolean,
  noDataTest?: boolean
): Promise<boolean> {
  const dataResult = noDataTest || (await checkData(buffer, step, getFilename));
  const imageResult =
    noImageTest || (await checkImages(page, step, getFilename));

  return imageResult && dataResult;
}

/**
 * Check the content of the buffer to match the expected result.
 * If there's nothing expected, save the current result as the expected for future tests
 */
async function checkData(
  buffer: Buffer,
  step: number,
  getFilename: (type: 'data', step: number, ext: 'png' | 'json') => string
): Promise<boolean> {
  const expectedPath = getFilename('data', step, 'json');
  const isNewTest = !existsSync(expectedPath);

  // get the current status data
  const data = ((buffer as unknown) as PrivateBuffer).matrix;

  // if it's the first time, we just store the result and finish
  if (isNewTest) {
    writeFileSync(expectedPath, JSON.stringify(data, null, 2));
    return true;
  }

  // if the data is there, read and compare it
  const expectedData = JSON.parse(readFileSync(expectedPath).toString());
  assert.deepEqual(data, expectedData);

  return true;
}

/**
 * Check the content of the canvas (as an image) to match the expected result.
 * If there's nothing expected, save the current result as the expected for future tests
 */
async function checkImages(
  page: puppeteer.Page,
  step: number,
  getFilename: (
    type: 'expected' | 'diff' | 'exec',
    step: number,
    ext: 'png' | 'json'
  ) => string
): Promise<boolean> {
  const expectedPath = getFilename('expected', step, 'png');
  const execPath = getFilename('exec', step, 'png');
  const isNewTest = !existsSync(expectedPath);
  const canvasHandler = await getPageCanvasHandler(page);

  // if the expected image doesn't exist, is the first time we run it so just generate it
  await canvasHandler.asElement()!.screenshot({
    path: isNewTest ? expectedPath : execPath,
  });

  // if is the first time, then we don't need to compare anything and we just finish
  if (isNewTest) {
    return true;
  }

  // if the expected image is there, we create one for the current test execution and compare it
  const diffPath = getFilename('diff', step, 'png');
  const imagesAreEqual = await compareImgs(expectedPath, execPath, {
    diffPath,
  });

  assert.isTrue(
    imagesAreEqual,
    `Image comparison failed. Difference stored in ${relative(
      VR_TEST_FOLDER,
      diffPath
    )}`
  );

  return imagesAreEqual;
}
