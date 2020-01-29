import * as puppeteer from 'puppeteer';
import { Buffer } from '@src/buffer';
import { basename, dirname, join, relative } from 'path';
import { describe, before, after } from 'mocha';
import { getVrTestFiles, VR_TEST_FOLDER } from './utils';
import { runVrTest } from './puppeteer';
import {
  WEBPACK_DEV_SERVER_PORT,
  VR_STATIC_FOLDER,
  VR_STATIC_FILE,
} from './webpack';

const DEBUG_MODE = process.argv.includes('--debug');
const PRESERVE_IMAGES = DEBUG_MODE || process.argv.includes('--noRm');
const NO_IMAGE_TEST = process.argv.includes('--noImage');
const NO_DATA_TEST = process.argv.includes('--noData');

export interface DOMRectLike {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
}

export interface PuppeteerTestData {
  page: puppeteer.Page;
  canvasHandler: puppeteer.JSHandle<HTMLCanvasElement>;
  // need to provide custom implementation because puppeteer's returns null
  getBounds: (elem: puppeteer.JSHandle) => Promise<DOMRectLike>;
}
export interface PuppeteerAfterTestData<R extends {} = never>
  extends PuppeteerTestData {
  data: R;
}
export interface BrowserTestData {
  canvas: HTMLCanvasElement;
}
export type TestDescription<R extends {} = never> = {
  description?: string;
  beforeTest?: PuppeteerTestFunction;
  test: BrowserTestFunction<R>;
  afterTest?: PuppeteerAfterTestFunction<R>;
};
export type PuppeteerTestFunction = (data: PuppeteerTestData) => Promise<void>;
export type PuppeteerAfterTestFunction<R extends {} = never> = (
  data: PuppeteerAfterTestData<R>
) => Promise<void>;
export type BrowserTestFunction<R extends {} = {}> = (
  data: BrowserTestData
) =>
  | BrowserTestFunctionReturnData<R>
  | Promise<BrowserTestFunctionReturnData<R>>;
export type TestCases<R extends {} = never> = TestDescription<{} & R>[];
export interface BrowserTestFunctionReturnData<R extends {} = never> {
  buffer: Buffer;
  data?: R;
}
export interface TestPageInfo {
  page: puppeteer.Page;
  canvasHandle: puppeteer.JSHandle<HTMLCanvasElement>;
}

let browser: puppeteer.Browser;
let page: puppeteer.Page;

function getFolderPath(file: string, type: 'expected' | 'exec'): string {
  return join(dirname(file), `__${type}`);
}

function getFilename(
  file: string,
  type: 'data' | 'expected' | 'diff' | 'exec',
  step: number
): string {
  const ext = type === 'data' ? 'json' : 'png';
  const filename = [
    basename(file).replace(/\.spec\.ts$/g, ''),
    `${step}${type === 'diff' ? '-diff' : ''}.${ext}`,
  ]
    .join('.')
    .toLowerCase();

  return join(
    getFolderPath(file, type.includes('exec') ? 'exec' : 'expected'),
    filename
  );
}

/**
 * Return a list of the test files to execute,
 * depending on the parameters used to start the test process
 */
function getTestFiles(): string[] {
  const argvFiles = process.argv.filter(
    arg => arg.endsWith('.spec.ts') && arg.includes('vr-test')
  );
  if (argvFiles.length === 0) {
    return getVrTestFiles();
  }
  return argvFiles;
}

before('set up the browser', async () => {
  // tslint:disable: no-console
  console.log(`Launching puppeteer...`);
  const browserOptions: puppeteer.LaunchOptions = {
    devtools: DEBUG_MODE,
  };
  browser = await puppeteer.launch(browserOptions);
  page = (await browser.pages())[0];
  let testUrl = `http://localhost:${WEBPACK_DEV_SERVER_PORT}/`;

  try {
    await page.goto(testUrl, {
      timeout: 3000,
    });
  } catch (e) {
    testUrl = `file://${VR_STATIC_FOLDER}/${VR_STATIC_FILE}`;
    await page.goto(testUrl, {
      timeout: 1000,
    });
  }
  console.log(`Running Visual Regression tests from ${testUrl}\n`);
});

after('clean the browser', async () => {
  await browser.close();
});

describe('Visual Regresion Tests', async function() {
  this.timeout(0);

  getTestFiles().forEach(file => {
    const relativePath = relative(VR_TEST_FOLDER, file);
    const steps = require(file).data as TestCases;

    it(relativePath, async () => {
      await runVrTest({
        page,
        steps,
        testCase: relativePath.replace(/\.spec\.ts$/g, ''),
        getFilename: getFilename.bind(null, file),
        preserveImages: PRESERVE_IMAGES,
        expectedFolderPath: getFolderPath(file, 'expected'),
        execFolderPath: getFolderPath(file, 'exec'),
        noDataTest: NO_DATA_TEST,
        noImageTest: NO_IMAGE_TEST,
      });
    });
  });
});
