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

export interface TestData {
  canvas: HTMLCanvasElement;
}
export type TestDescription = {
  description?: string;
  fn: TestFunction;
};
export type TestFunction = (data: TestData) => void | Promise<void>;
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
  try {
    await page.goto(`http://localhost:${WEBPACK_DEV_SERVER_PORT}/`, {
      timeout: 1000,
    });
  } catch (e) {
    await page.goto(`file://${VR_STATIC_FOLDER}/${VR_STATIC_FILE}`, {
      timeout: 1000,
    });
  }
});

after('clean the browser', async () => {
  await browser.close();
});

describe('Visual Regresion Tests', async function() {
  this.timeout(0);

  getVrTestFiles().forEach(file => {
    const relativePath = relative(VR_TEST_FOLDER, file);

    it(relativePath, async () => {
      await runVrTest({
        page,
        testCase: relativePath.replace(/\.spec\.ts$/g, ''),
        getImageFilename: getImageFilename.bind(null, file),
        preserveImages: PRESERVE_IMAGES,
        expectedFolderPath: getImageFolderPath(file, 'expected'),
        execFolderPath: getImageFolderPath(file, 'exec'),
      });
    });
  });
});
