import * as puppeteer from 'puppeteer';
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
export interface BrowserTestData {
  canvas: HTMLCanvasElement;
}
export type TestDescription = {
  description?: string;
  beforeTest?: PuppeteerTestFunction;
  test: BrowserTestFunction;
  afterTest?: PuppeteerTestFunction;
};
export type PuppeteerTestFunction = (data: PuppeteerTestData) => Promise<void>;
export type BrowserTestFunction = (
  data: BrowserTestData
) => void | Promise<void>;
export type TestCases = TestDescription[];

export interface TestPageInfo {
  page: puppeteer.Page;
  canvasHandle: puppeteer.JSHandle<HTMLCanvasElement>;
}

let browser: puppeteer.Browser;
let page: puppeteer.Page;

function getImageFolderPath(file: string, type: 'expected' | 'exec'): string {
  return join(dirname(file), `__${type}`);
}

function getImageFilename(
  file: string,
  type: 'expected' | 'exec' | 'diff',
  step: number
): string {
  const filename = [
    basename(file).replace(/\.spec\.ts$/g, ''),
    `${step}${type === 'diff' ? '-diff' : ''}.png`,
  ]
    .join('.')
    .toLowerCase();

  return join(
    getImageFolderPath(file, type === 'diff' ? 'exec' : type),
    filename
  );
}

before('set up the browser', async () => {
  const browserOptions: puppeteer.LaunchOptions = {
    devtools: DEBUG_MODE,
  };
  browser = await puppeteer.launch(browserOptions);
  page = (await browser.pages())[0];
  let testUrl = `http://localhost:${WEBPACK_DEV_SERVER_PORT}/`;
  try {
    await page.goto(testUrl, {
      timeout: 1000,
    });
  } catch (e) {
    testUrl = `file://${VR_STATIC_FOLDER}/${VR_STATIC_FILE}`;
    await page.goto(testUrl, {
      timeout: 1000,
    });
  }
  // tslint:disable-next-line: no-console
  console.log(`Running Visual Regression tests from ${testUrl}\n`);
});

after('clean the browser', async () => {
  await browser.close();
});

describe('Visual Regresion Tests', async function() {
  this.timeout(0);

  getVrTestFiles().forEach(file => {
    const relativePath = relative(VR_TEST_FOLDER, file);
    const steps = require(file).data as TestCases;

    it(relativePath, async () => {
      await runVrTest({
        page,
        steps,
        testCase: relativePath.replace(/\.spec\.ts$/g, ''),
        getImageFilename: getImageFilename.bind(null, file),
        preserveImages: PRESERVE_IMAGES,
        expectedFolderPath: getImageFolderPath(file, 'expected'),
        execFolderPath: getImageFolderPath(file, 'exec'),
      });
    });
  });
});
