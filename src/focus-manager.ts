import { Buffer, BufferOptions } from './buffer';
import { FocusableElement } from './focusable-element';
import { EventAttached } from './node';

type BaseFocusManagerOptions = Partial<BufferOptions> &
  Pick<BufferOptions, 'canvas'>;

export class FocusManager<
  C extends FocusableElement = FocusableElement
> extends Buffer<C> {
  /** Currently focused element, if any */
  protected focusedElement?: C;
  /** Ordered list of focusable elements */
  protected readonly focusableElements: FocusableElement[] = [];

  constructor(options: BaseFocusManagerOptions) {
    super(options);

    this.on('blur', ({ target }) => {
      if (
        ((target as unknown) as C) === this.focusedElement &&
        (target as unknown) !== this
      ) {
        this.focusedElement = undefined;
      }
    });

    this.on('focus', ({ target }) => {
      if (
        ((target as unknown) as C) !== this.focusedElement &&
        (target as unknown) !== this
      ) {
        this.focusedElement?.blur();
        this.focusedElement = (target as unknown) as C;
      }
    });

    this.on('attach', event => {
      this.addFocusableElement(
        ((event as unknown) as EventAttached).node as FocusableElement
      );
    });

    this.on('dettach', event => {
      this.removeFocusableElement(
        ((event as unknown) as EventAttached).node as FocusableElement
      );
    });
  }

  /**
   * Retrieve the current focused element, or `undefined` if none
   */
  public getFocusedElement(): C | undefined {
    return this.focusedElement;
  }

  /**
   * Focus the next element.
   * If it's the last, it will focus the first one
   */
  public focusNext(): void {
    const elements = this.focusableElements;
    if (elements.length < 2) return;

    const index = this.focusedElement
      ? (elements.indexOf(this.focusedElement) + 1) % elements.length
      : 0;
    elements[index].focus();
  }

  /**
   * Focus the previous element.
   * If it's the first, it will focus the last one
   */
  public focusPrev(): void {
    const elements = this.focusableElements;
    if (elements.length < 2) return;

    const index = this.focusedElement
      ? (elements.indexOf(this.focusedElement) + elements.length - 1) %
        elements.length
      : elements.length - 1;
    elements[index].focus();
  }

  /**
   * Traverse an element adding it and its children to the focusable element list
   */
  private addFocusableElement(elem: FocusableElement): void {
    const listToAdd = this.getDescendants(elem).filter(elem =>
      elem.isFocusable()
    );
    if (listToAdd.length === 0) return;

    const elements = this.focusableElements;
    let index = this.getFocusableElementInsertIndex(
      listToAdd[0],
      (this as unknown) as FocusableElement
    );
    if (index === -1 || index === undefined) {
      index = elements.length;
    }
    elements.splice(index, 0, ...listToAdd);
  }

  /**
   * Remove the dettached element and all its descendant from the list of focusable elements
   */
  private removeFocusableElement(elem: FocusableElement): void {
    const listToRemove = this.getDescendants(elem);
    for (const elemToRemove of listToRemove) {
      const index = this.focusableElements.indexOf(elemToRemove);
      if (index === -1) continue;
      this.focusableElements.splice(index, 1)[0];
    }
  }

  /**
   * Traverse an element and its descendants and return an ordered list of all found elements
   */
  private getDescendants(
    elem: FocusableElement,
    acc: FocusableElement[] = []
  ): FocusableElement[] {
    acc.push(elem);

    for (const child of elem.getChildren()) {
      this.getDescendants(child, acc);
    }

    return acc;
  }

  /**
   * Get the index of `focusableElements` where `elem` should be inserted
   *
   * @param elem Element to insert
   * @param start Root where to start in the recursive function
   * @param prev Like `getDescendants`' `acc`, but only maintaining the last element
   */
  private getFocusableElementInsertIndex(
    elem: FocusableElement,
    start: FocusableElement,
    prev: FocusableElement[] = []
  ): number | undefined {
    if (elem === start) {
      const index = this.focusableElements.indexOf(prev[0]!);
      return index === -1 ? -1 : index + 1;
    }

    if (start.isFocusable && start.isFocusable()) {
      prev[0] = start;
    }
    for (const child of start.getChildren()) {
      const result = this.getFocusableElementInsertIndex(elem, child, prev);
      if (result !== undefined) return result;
    }
  }
}
