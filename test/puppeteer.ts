import * as puppeteer from 'puppeteer';
import { existsSync } from 'fs';
import { relative } from 'path';
import { sync as rimraf } from 'rimraf';
import { assert } from 'chai';
import { sync as mkdirp } from 'mkdirp';
import { compareImgs } from './compare-imgs';
import { TestWindow } from './html';
import { VR_TEST_FOLDER } from './utils';

export interface VrTestOptions {
  testCase: string;
  page: puppeteer.Page;
  preserveImages: boolean;
  expectedFolderPath: string;
  execFolderPath: string;
  getImageFilename: (
    type: 'expected' | 'exec' | 'diff',
    step: number
  ) => string;
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
  page,
  preserveImages,
  expectedFolderPath,
  execFolderPath,
  getImageFilename,
}: VrTestOptions): Promise<void> {
  if (!existsSync(expectedFolderPath)) {
    mkdirp(expectedFolderPath);
  }
  if (!existsSync(execFolderPath)) {
    mkdirp(execFolderPath);
  }

  let allOk = true;

  async function onStep(step: number): Promise<void> {
    const expectedPath = getImageFilename('expected', step);
    const execPath = getImageFilename('exec', step);
    const isNewTest = !existsSync(expectedPath);
    const canvasHandler = await page.evaluateHandle(() =>
      document.querySelector('#test canvas')
    );

    // if the expected image doesn't exist, is the first time we run it so just generate it
    await canvasHandler.asElement()!.screenshot({
      path: isNewTest ? expectedPath : execPath,
    });
    if (isNewTest) {
      return;
    }

    // if the expected image is there, we create one for the current test execution and compare it
    const diffPath = getImageFilename('diff', step);
    const imagesAreEqual = await compareImgs(expectedPath, execPath, {
      diffPath,
    });
    allOk = allOk && imagesAreEqual;
    assert.isTrue(
      imagesAreEqual,
      `Image comparison failed. Difference stored in ${relative(
        VR_TEST_FOLDER,
        diffPath
      )}`
    );
  }

  // execute all the test steps
  let step = 0;
  for (;;) {
    const testExecuted = await page.evaluate(
      async (testCase, step) => {
        return await ((window as unknown) as TestWindow).loadTest(testCase, {
          step,
        });
      },
      testCase,
      step
    );

    if (!testExecuted) {
      break;
    }
    await onStep(step);
    step++;
  }

  if (allOk && !preserveImages) {
    rimraf(execFolderPath);
  }
}
