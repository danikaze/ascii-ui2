import { loadTest } from './test';

let currentTestCase = '';
let currentStep = 0;
let firstTime = true;

/**
 * Creates a progress bar to choose between the steps of the test case
 */
export function initProgressBar(
  testCase: string,
  nSteps: number,
  step?: number
): void {
  const container = document.querySelector('#progress-bar')!;
  const prevStep = document.querySelector('#previous-step')!;
  const nextStep = document.querySelector('#next-step')!;

  container.innerHTML = '';

  for (let s = 0; s < nSteps; s++) {
    const button = document.createElement('div');
    button.innerText = String(s);
    button.classList.add('button');
    button.addEventListener('click', () => selectStep(s));
    container.append(button);
  }

  if (firstTime) {
    prevStep.addEventListener('click', () => selectStep(currentStep - 1));
    nextStep.addEventListener('click', () => selectStep(currentStep + 1));
    firstTime = false;
  }

  currentTestCase = testCase;
  updateProgressBar(step !== undefined ? step : nSteps - 1);
}

/**
 * Update the progress bar state given a selected step
 */
export function updateProgressBar(step: number): void {
  const bg = document.querySelector('#progress-bar')!;
  const prevStep = document.querySelector('#previous-step')!;
  const nextStep = document.querySelector('#next-step')!;
  const lastStep = bg.children.length - 1;

  const newStep = Math.max(0, Math.min(lastStep, step));
  if (currentStep === newStep) return;
  currentStep = newStep;

  // next/prev buttons clickability
  if (currentStep <= 0) {
    prevStep.classList.add('disabled');
  } else {
    prevStep.classList.remove('disabled');
  }

  if (currentStep >= lastStep) {
    nextStep.classList.add('disabled');
  } else {
    nextStep.classList.remove('disabled');
  }

  // progress buttons style
  for (let s = 0; s <= newStep; s++) {
    bg.children[s].classList.add('done');
  }
  for (let s = newStep + 1; s <= lastStep; s++) {
    bg.children[s].classList.remove('done');
  }
}

/**
 * Select a test case step executing the necessary ones to reach that state
 */
async function selectStep(step: number): Promise<void> {
  const bg = document.querySelector('#progress-bar')!;
  const lastStep = bg.children.length - 1;
  const newStep = Math.max(0, Math.min(lastStep, step));
  const current = currentStep;

  // test execution
  if (newStep < current) {
    for (let s = 0; s <= step; s++) {
      await loadTest(currentTestCase, { step: s });
      updateProgressBar(s);
    }
  } else if (newStep > current) {
    for (let s = current + 1; s <= step; s++) {
      await loadTest(currentTestCase, { step: s });
      updateProgressBar(s);
    }
  }
}
