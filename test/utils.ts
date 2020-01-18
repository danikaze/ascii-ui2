import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export const VR_TEST_FOLDER = join(__dirname, '..', 'vr-test');

/**
 * Get the full list of vr-test files
 */
export function getVrTestFiles(): string[] {
  function filter(file: string): boolean {
    return /\.spec\.ts$/.test(file);
  }

  return getFilesDeep(VR_TEST_FOLDER, filter);
}

/**
 * Read all the files in a folder recursively
 * If `filter` is specified, only files matching it will be returned
 */
function getFilesDeep(
  folder: string,
  filter?: (file: string) => boolean,
  acc: string[] = []
): string[] {
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
