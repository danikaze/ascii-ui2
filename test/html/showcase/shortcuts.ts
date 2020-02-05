function focusFilter(event: KeyboardEvent) {
  document.getElementById('sidebar-filter')!.focus();
  event.preventDefault();
}

function focusAndclearFilter(event: KeyboardEvent) {
  const filter = document.getElementById('sidebar-filter')! as HTMLInputElement;
  filter.focus();
  filter.value = '';
  event.preventDefault();
}

function expandAll() {
  (document.querySelector(
    '#sidebar-collapse-all.closed'
  ) as HTMLElement)?.click();
}

function collapseAll() {
  (document.querySelector(
    '#sidebar-collapse-all:not(.closed)'
  ) as HTMLElement)?.click();
}

function firstStep() {
  const firstButton = document.querySelector(
    '#progress-bar .button:first-of-type'
  )! as HTMLElement;
  firstButton.click();
}

function lastStep() {
  const firstButton = document.querySelector(
    '#progress-bar .button:last-of-type'
  )! as HTMLElement;
  firstButton.click();
}

function prevStep() {
  document.getElementById('previous-step')!.click();
}

function nextStep() {
  document.getElementById('next-step')!.click();
}

function moveTest(delta: number): void {
  const tests = Array.from(
    document.querySelectorAll('#sidebar-index .file')
  ) as HTMLElement[];
  const activeTest = document.querySelector(
    '#sidebar-index .file.active'
  )! as HTMLElement;
  const nextIndex = tests.indexOf(activeTest) + delta;

  if (nextIndex < 0 || nextIndex >= tests.length) return;
  tests[nextIndex].click();
}

function prevTest() {
  moveTest(-1);
}

function nextTest() {
  moveTest(1);
}

function toggleSidebar() {
  document.getElementById('sidebar-button')!.click();
}

function toggleHelp() {
  document.getElementById('sidebar-help-button')!.click();
}

/**
 * Register global shortcuts to control the showcase with keys
 */
export function registerShortcuts(): void {
  const KEYCODE_PLUS = 187; // plus "+"
  const KEYCODE_MINUS = 189; // minus "-"
  const KEYCODE_SLASH = 191; // slash "/"

  const keyMapping: [
    (ev: KeyboardEvent) => boolean,
    (ev: KeyboardEvent) => void
  ][] = [
    [event => event.key.toLowerCase() === 's', toggleSidebar],
    [event => event.key.toLowerCase() === 'h', toggleHelp],
    [
      event => {
        return (
          event.altKey && (event.key === '/' || event.keyCode === KEYCODE_SLASH)
        );
      },
      focusAndclearFilter,
    ],
    [
      event => event.key === '/' || event.keyCode === KEYCODE_SLASH,
      focusFilter,
    ],
    [
      event =>
        event.altKey && (event.key === '-' || event.keyCode === KEYCODE_MINUS),
      collapseAll,
    ],
    [
      event =>
        event.altKey && (event.key === '+' || event.keyCode === KEYCODE_PLUS),
      expandAll,
    ],
    [event => event.altKey && event.key === 'Home', firstStep],
    [event => event.altKey && event.key === 'End', lastStep],
    [event => event.altKey && event.key === 'ArrowLeft', prevStep],
    [event => event.altKey && event.key === 'ArrowRight', nextStep],
    [event => event.altKey && event.key === 'ArrowUp', prevTest],
    [event => event.altKey && event.key === 'ArrowDown', nextTest],
  ];
  const filterElem = document.getElementById('sidebar-filter');

  window.addEventListener('keydown', event => {
    if (filterElem === document.activeElement) {
      if (event.key === 'Escape' || event.key === 'Enter') {
        document.getElementById('sidebar-filter')!.blur();
      }
      return;
    }

    const fn = keyMapping.filter(item => item[0](event))[0];
    if (fn) {
      fn[1](event);
    }
  });
}
