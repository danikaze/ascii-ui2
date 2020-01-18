import { basename } from 'path';
import * as GitRevisionPlugin from 'git-revision-webpack-plugin';

type FsTree = {
  [name: string]: {
    folders: FsTree;
    files: string[];
  };
};

/**
 * Get the list of values to use in the template for HtmlWebpackPlugin
 */
export function getTemplateVars(
  testCases: string[],
  gitPlugin: GitRevisionPlugin
) {
  return {
    index: getIndexHtml(testCases),
    gitInfo: `${gitPlugin.branch()}:${gitPlugin.version()}`,
  };
}

/**
 * Get the HTML to use in the sidebar as the index with all the test cases
 */
function getIndexHtml(testCases: string[]) {
  const tree = filesToTree(testCases);

  return `<ul class="folder root">${folderToHtml(tree)}</ul>`;
}

/**
 * Get the HTML to represent a file tree structure, recursively
 */
function folderToHtml(tree: FsTree, testCase = ''): string {
  return Object.keys(tree)
    .sort()
    .reduce((str, folderName) => {
      const item = tree[folderName];
      const newTestCase = `${testCase ? `${testCase}/` : ''}${folderName}`;
      const folders = folderToHtml(item.folders, newTestCase);
      const files = item.files
        .sort()
        .map(
          fileName =>
            `<li class="file" data-case="${newTestCase}/${fileName}">${fileName}</li>`
        )
        .join('');

      return (
        str +
        `<li class="folder"><div class="folder-name">${basename(
          newTestCase
        )}/</div><ul class="contents">${folders}${files || ''}</ul></li>`
      );
    }, '');
}

/**
 * Transform a list of files to tree structure
 */
function filesToTree(files: string[]): FsTree {
  const tree: FsTree = {};

  for (const name of files) {
    const parts = name.split(/[\\\/]/);
    let lastParent = tree;
    let parent = tree;
    let part = '';

    for (let i = 0; i < parts.length - 1; i++) {
      part = parts[i];
      if (!parent[part]) {
        parent[part] = {
          folders: {},
          files: [],
        };
      }
      lastParent = parent;
      parent = parent[part].folders;
    }

    if (part) {
      lastParent[part].files.push(parts[parts.length - 1]);
    }
  }

  return tree;
}
