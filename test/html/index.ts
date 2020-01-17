const indexLi: { [name: string]: HTMLLIElement } = {};
let activeIndexLi: HTMLLIElement;
let filter = '';

async function loadTest(testCase: string): Promise<void> {
  let data;
  try {
    const mod = require(`../../vr-test/${testCase}.spec`);
    data = mod.data;
    if (!data) {
      throw new Error();
    }
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.warn(`data not found for test "${testCase}"`);
    return;
  }

  // select the active element in the index
  if (activeIndexLi) {
    activeIndexLi.classList.remove('active');
  }
  activeIndexLi = indexLi[testCase];
  activeIndexLi.classList.add('active');

  // set the title
  document.getElementById('test-case-name')!.innerText = testCase;

  // replace the canvas by a new one to ensure resetting it
  const canvas = document.createElement('canvas');
  const container = document.getElementById('test')!;
  container.innerHTML = '';
  container.append(canvas);

  // execute tests
  const testData = { canvas };
  if (!Array.isArray(data)) {
    await data(testData);
  } else {
    for (const fn of data) {
      await fn(testData);
    }
  }
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
