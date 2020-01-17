const indexLi: { [name: string]: HTMLLIElement } = {};
let activeIndexLi: HTMLLIElement;
let filter = '';

export interface LoadTestOptions {
  step?: number;
}

export interface TestWindow extends Window {
  loadTest: (testCase: string, options?: LoadTestOptions) => Promise<boolean>;
}

/**
 * This function:
 * - Reset the page for a new test (if step is <= 0)
 * - If no `step` is specified, run all of them
 * - If a `step` is specified, run only that one
 *
 * Returns `false` if the specified step didn't exist, `true` if it was executed.
 * Even if the step doesn't exist, it will prepare the page
 */
async function loadTest(
  testCase: string,
  options: LoadTestOptions = {}
): Promise<boolean> {
  let data;
  const testName = testCase.replace(/\\/g, '/');
  try {
    const mod = require(`../../vr-test/${testName}.spec`);
    data = mod.data;
    if (!data) {
      throw new Error();
    }
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.warn(`data not found for test "${testName}"`);
    return false;
  }

  // select the active element in the index
  if (activeIndexLi) {
    activeIndexLi.classList.remove('active');
  }
  activeIndexLi = indexLi[testName];
  activeIndexLi.classList.add('active');

  // set the title
  document.getElementById('test-case-name')!.innerText = testName;

  const { step } = options;
  let canvas = document.querySelector('#test canvas');

  // replace the canvas by a new one to ensure resetting it
  if (!canvas || step === undefined || step <= 0) {
    canvas = document.createElement('canvas');
    const container = document.getElementById('test')!;
    container.innerHTML = '';
    container.append(canvas);
  }

  // execute tests
  const testData = { canvas };

  // run only one step
  if (step !== undefined) {
    // only one step available
    if (!Array.isArray(data)) {
      if (step !== 0) {
        return false;
      }
      await data(testData);
      return true;
    }
    // list of steps available
    if (step < 0 || step >= data.length) {
      return false;
    }
    await data[step](testData);
    return true;
  }

  // all steps
  if (!Array.isArray(data)) {
    await data(testData);
  } else {
    for (const fn of data) {
      await fn(testData);
    }
  }
  return true;
}

function toggleSidebar() {
  document.body.classList.toggle('sidebar-hidden');
}

function filterTestCases(newFilter: string): void {
  if (filter === newFilter.toLowerCase()) return;
  filter = newFilter.toLowerCase();

  // make everything visible
  document
    .querySelectorAll<HTMLLIElement>(
      '#sidebar-index .file.filtered, #sidebar-index .folder.filtered'
    )
    .forEach(el => {
      el.classList.remove('filtered');
    });

  if (!filter) return;

  // filter-out files not matching
  document
    .querySelectorAll<HTMLLIElement>('#sidebar-index .file')
    .forEach(li => {
      const name = li.innerText.toLowerCase();
      const testCase = li.dataset.case!.toLowerCase();
      if (name.indexOf(filter) === -1 && testCase.indexOf(filter) === -1) {
        li.classList.add('filtered');
      }
    });

  // filter-in everything under a matching folder
  document
    .querySelectorAll<HTMLDivElement>('#sidebar-index .folder-name')
    .forEach(div => {
      const name = div.innerText.toLowerCase();
      if (name.indexOf(filter) !== -1) {
        div
          .parentElement!.querySelectorAll('.file')
          .forEach(li => li.classList.remove('filtered'));
      }
    });

  function queryAllChildren<
    T extends Element = Element,
    P extends Element = Element
  >(parent: P, query: string): T[] {
    return Array.from(parent.querySelectorAll<T>(query)).filter(
      el => el.parentNode === parent
    );
  }

  // if everything is filtered under a folder (is empty), filter it out too
  function checkFolder(folderLi: HTMLLIElement): boolean {
    const contents = folderLi.querySelector<HTMLUListElement>('.contents')!;
    const directSubFolders = queryAllChildren<HTMLLIElement>(
      contents,
      '.folder'
    );
    directSubFolders.forEach(checkFolder);

    const isVisible = queryAllChildren<HTMLLIElement>(
      contents,
      '.file, .folder'
    ).some(file => !file.classList.contains('filtered'));
    if (!isVisible) {
      folderLi.classList.add('filtered');
    }
    return isVisible;
  }

  queryAllChildren<HTMLLIElement>(
    document.querySelector('#sidebar-index > ul')!,
    '.folder'
  ).forEach(checkFolder);
}

function enablePageBehavior() {
  // clicking on files => load test cases
  document
    .querySelectorAll<HTMLLIElement>('#sidebar-index .file')
    .forEach(li => {
      const testCase = li.dataset.case!;
      indexLi[testCase] = li;

      li.addEventListener('click', () => {
        history.pushState(testCase, testCase, `?case=${testCase}`);
        loadTest(testCase);
      });
    });

  // clicking on folders => toggle them
  document
    .querySelectorAll<HTMLDivElement>('#sidebar-index .folder-name')
    .forEach(div => {
      div.addEventListener('click', () => {
        div.parentElement!.classList.toggle('closed');
      });
    });

  // load initial test case, if any
  const initialUrl = new URL(location.href);
  const testCase = initialUrl.searchParams.get('case');
  if (testCase) {
    loadTest(testCase);
  }

  // load test case when history.back
  window.addEventListener('popstate', ({ state }) => {
    loadTest(state);
  });

  // click on sidebar-button => toggle sidebar
  document
    .getElementById('sidebar-button')!
    .addEventListener('click', toggleSidebar);

  // click on +/- button => toggle all folders of first level
  document
    .getElementById('sidebar-collapse-all')!
    .addEventListener('click', ev => {
      (ev.target as HTMLDivElement).classList.toggle('closed');
      const isClosed = !(ev.target as HTMLDivElement).classList.contains(
        'closed'
      );
      document
        .querySelectorAll<HTMLLIElement>('#sidebar-index > ul > li')
        .forEach(li => {
          if (isClosed) {
            li.classList.remove('closed');
          } else {
            li.classList.add('closed');
          }
        });
    });

  // change the filter value
  document.getElementById('sidebar-filter')!.addEventListener('keyup', ev => {
    filterTestCases((ev.target! as HTMLInputElement).value);
  });

  // clear the filter value
  document
    .getElementById('sidebar-clear-filter')!
    .addEventListener('click', () => {
      (document.getElementById('sidebar-filter')! as HTMLInputElement).value =
        '';
      filterTestCases('');
    });
}

enablePageBehavior();
((window as unknown) as TestWindow).loadTest = loadTest;
