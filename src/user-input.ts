import { isArray } from 'vanilla-type-check/isArray';

interface UserInputEvent {
  /** `true` if the Shift key was pressed */
  shiftKey: boolean;
  /** `true` if the Control key was pressed */
  ctrlKey: boolean;
  /** `true` if the Alt key was pressed */
  altKey: boolean;
  /** `true` if the Meta key was pressed (Window key in Win / Command in Mac) */
  metaKey: boolean;
}

export interface KeyEventData extends UserInputEvent {
  /** Name of the used key (i.e. "a") */
  key: string;
  /** Code of the used key (i.e. "KeyA") */
  code: string;
  /**
   * keyCode of the used key (i.e. 65)
   * Note that keyCode is different in keyup/keydown and keypress events
   */
  keyCode: number;
}

export interface MouseEventData extends UserInputEvent {
  /** Mouse button used in the event */
  button: number;
}

export type InputDefinition = Partial<KeyEventData | MouseEventData>;

/**
 * Allow for complex comparisons between with input events
 *
 * If an array of `wanted` declarations are specified, it return trues if it's true for any of them
 * Note that if the definition is empty, it will match always
 *
 * @param wanted input declaration or declarations for the wanted match
 * @param inputData same data as the one incoming from the input events
 */
export function inputMatch(
  wanted: InputDefinition | InputDefinition[],
  inputData: KeyEventData | MouseEventData
): boolean {
  if (!isArray(wanted)) {
    return compareOne(wanted, inputData);
  }
  return wanted.some(w => compareOne(w, inputData));
}

/**
 * Performs a comparison between a single input definition and an input event
 */
function compareOne(
  wanted: InputDefinition,
  event: KeyEventData | MouseEventData
): boolean {
  const basicComparison =
    (undefined === wanted.shiftKey || wanted.shiftKey === event.shiftKey) &&
    (undefined === wanted.ctrlKey || wanted.ctrlKey === event.ctrlKey) &&
    (undefined === wanted.altKey || wanted.altKey === event.altKey) &&
    (undefined === wanted.metaKey || wanted.metaKey === event.metaKey);

  return (
    basicComparison &&
    (undefined === (event as MouseEventData).button
      ? compareKeyEvent(wanted as KeyEventData, event as KeyEventData)
      : compareMouseEvent(wanted as MouseEventData, event as MouseEventData))
  );
}

/**
 * Performs a comparison between a single key definition and a key event
 */
function compareKeyEvent(wanted: KeyEventData, event: KeyEventData): boolean {
  return (
    (undefined === wanted.key || wanted.key === event.key) &&
    (undefined === wanted.code || wanted.code === event.code) &&
    (undefined === wanted.keyCode || wanted.keyCode === event.keyCode)
  );
}

/**
 * Performs a comparison between a single mouse definition and a mouse event
 */
function compareMouseEvent(
  wanted: MouseEventData,
  event: MouseEventData
): boolean {
  return undefined === wanted.button || wanted.button === event.button;
}
