import * as resemble from 'resemblejs';
import { writeFileSync } from 'fs';

interface CompareImgsOptions {
  diffPath?: string;
}

export function compareImgs(
  path1: string,
  path2: string,
  options: CompareImgsOptions = {}
): Promise<boolean> {
  return new Promise(resolve => {
    resemble(path1)
      .compareTo(path2)
      .ignoreNothing()
      .onComplete(data => {
        // tslint:disable: no-any
        const isEqual =
          data.isSameDimensions && (data as any).rawMisMatchPercentage === 0;

        if (options.diffPath && !isEqual) {
          writeFileSync(options.diffPath, (data as any).getBuffer());
        }

        resolve(isEqual);
      });
  });
}
