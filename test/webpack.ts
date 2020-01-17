/*
 * This file has utility functions related with webpack configuration
 */

import { join, relative } from 'path';
import { getVrTestFiles, VR_TEST_FOLDER } from './utils';

export const VR_STATIC_FOLDER = join(__dirname, '..', 'vr-test-static');
export const VR_STATIC_FILE = 'index.html';
export const WEBPACK_DEV_SERVER_PORT = 9000;

/**
 * Given an object, transform it so it can be used with DefinePlugin
 */
export function getDefineValues<
  T extends { [k: string]: unknown },
  D extends { [k in keyof T]: string }
>(obj: T): D {
  const res = {} as D;

  Object.keys(obj).forEach(k => {
    // tslint:disable-next-line: no-any
    (res as any)[k] = JSON.stringify(obj[k]);
  });

  return res;
}

/**
 * Get the entries to use in webpack
 */
export function getEntries(): string[] {
  return [join(__dirname, 'html', 'index.ts'), join(__dirname, 'all.js')];
}

/**
 * Get a list of chunks
 */
export function getChunkFiles(): string[] {
  return getVrTestFiles().map(getChunkName);
}

/**
 * Get the chunk name from a file name
 */
function getChunkName(file: string) {
  const stripFile = file.substring(0, file.length - '.spec.ts'.length);
  return relative(VR_TEST_FOLDER, stripFile);
}
