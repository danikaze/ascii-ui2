/*
 * This file has utility functions related with webpack configuration
 */

import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const VR_TEST_FOLDER = join(__dirname, '..', 'vr-test');

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
 * Get the full list of vr-test files
 */
function getVrTestFiles() {
  function filter(file: string): boolean {
    return /\.spec\.ts$/.test(file);
  }

  return getFilesDeep(VR_TEST_FOLDER, filter);
}

/**
 * Get the chunk name from a file name
 */
function getChunkName(file: string) {
  const stripFile = file.substring(0, file.length - '.spec.ts'.length);
  return relative(VR_TEST_FOLDER, stripFile);
}

/**
 * Read all the files in a folder recursively
 * If `filter` is specified, only files matching it will be returned
 */
function getFilesDeep(
  folder: string,
  filter?: (file: string) => boolean,
  acc: string[] = []
) {
  readdirSync(folder).forEach(file => {
    const filePath = join(folder, file);
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      getFilesDeep(filePath, filter, acc);
    } else if (!filter || filter(filePath)) {
      acc.push(filePath);
    }
  });

  return acc;
}
