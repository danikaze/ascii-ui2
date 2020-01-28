import { Element, ElementOptions } from './element';

/**
 * Event emmited to itself, when the element gains the focus
 */
export type EventFocus = Event;
/**
 * Event emmited to itself, when the element loses the focus
 */
export type EventBlur = Event;

export interface FocusableElementOptions<
  C extends FocusableElement = FocusableElement,
  P extends FocusableElement = FocusableElement
> extends ElementOptions<C, P> {
  /** If the element can receive focus or not (`true` by default) */
  focusable?: boolean;
}

export class FocusableElement<
  C extends FocusableElement = BaseFocusableElement,
  P extends FocusableElement = BaseFocusableElement
> extends Element<C, P> {
  /** If the element can receive focus or not */
  protected focusable: boolean;
  /** `true` if the element is focused */
  protected focused: boolean = false;

  constructor(options: FocusableElementOptions<C, P>) {
    super(options);
    this.focusable = options.focusable !== false;
  }

  /**
   * Gives the focus to the element.
   * Note that if there's no focus manager being used,
   * several elements can be focused at the same time technically
   */
  public focus(): void {
    if (!this.focusable || this.focused) return;
    this.focused = true;
    this.emit('focus');
  }

  /**
   * Removes the focus from the element
   */
  public blur(): void {
    if (!this.focusable || !this.focused) return;
    this.focused = false;
    this.emit('blur');
  }

  /**
   * Retrieve if the element is currentlyfocused
   */
  public isFocused(): boolean {
    return this.focused;
  }

  /**
   * Retrieve if the element can receive the focus or not
   */
  public isFocusable(): boolean {
    return this.focusable;
  }
}

interface BaseFocusableElement
  extends FocusableElement<FocusableElement, FocusableElement> {}
