import { loadTest } from './test';

const indexLi: { [name: string]: HTMLLIElement } = {};
let activeIndexLi: HTMLLIElement;

/**
 * Makes the sidebar dynamic
 */
export function initSidebar() {
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

  // click on sidebar-button => toggle sidebar
  document
    .getElementById('sidebar-button')!
    .addEventListener('click', toggleSidebar);

  // clicking on sidebar-shorcuts-button => toggle shortcuts
  document
    .getElementById('sidebar-help-button')!
    .addEventListener('click', toggleHelp);

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
}

/**
 * Set the specified test as active in the sidebar
 */
export function setActiveTest(testName: string): void {
  if (activeIndexLi) {
    activeIndexLi.classList.remove('active');
  }
  activeIndexLi = indexLi[testName];
  activeIndexLi.classList.add('active');

  let parent = activeIndexLi.parentElement;
  while (parent) {
    if (parent.classList.contains('folder')) {
      parent.classList.remove('closed');
    }
    parent = parent.parentElement;
  }
}

function toggleSidebar() {
  document.body.classList.toggle('sidebar-hidden');
}

function toggleHelp() {
  document.querySelector('#sidebar-help .contents')!.classList.toggle('hidden');
}
