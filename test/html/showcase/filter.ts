let filter = '';

export function initFilter(): void {
  // change the filter value
  document.getElementById('sidebar-filter')!.addEventListener('keyup', ev => {
    applyFilter((ev.target! as HTMLInputElement).value);
  });

  // clear the filter value
  document
    .getElementById('sidebar-clear-filter')!
    .addEventListener('click', () => {
      (document.getElementById('sidebar-filter')! as HTMLInputElement).value =
        '';
      applyFilter('');
    });
}

/**
 * Apply the specified filter to the index of files
 */
function applyFilter(newFilter: string): void {
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
