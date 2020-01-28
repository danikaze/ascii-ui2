import { Node } from './node';
import { MouseEventData, KeyEventData } from './user-input';

export interface BufferMouseEvent extends MouseEventData {
  /** X-Position (in pixels) of the mouse relative to the buffer */
  x: number;
  /** Y-Position (in pixels) of the mouse relative to the buffer */
  y: number;
  /** X-Position (in columns) of the mouse in the buffer */
  col: number;
  /** Y-Position (in rows) of the mouse in the buffer */
  row: number;
}

export type BufferKeyEvent = KeyEventData;

export interface InputEventListenerOptions {
  /** Associated element where to listen to */
  eventTarget: HTMLElement;
  /**
   * Prevents default on captured events (i.e. TAB will change the focus of the window)
   * Defaults to `true`
   */
  eventPreventDefault?: boolean;
  /**
   * Prevents propagation on captured events to avoid parents to receive them
   * Defaults to 'false
   */
  eventStopPropagation?: boolean;
  /** Width of a tile (needed to calculate columns in mouse events) */
  tileWidth: number;
  /** Height of a tile (needed to calculate rows in mouse events) */
  tileHeight: number;
}

type MouseEventTypes =
  | 'click'
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseout'
  | 'mouseover'
  | 'mouseup';
type KeyEventTypes = 'keydown' | 'keyup' | 'keypress';
type NoDataEventTypes = 'focus' | 'blur';
type EventTypes = MouseEventTypes | KeyEventTypes | NoDataEventTypes;
/**
 * Special type of Node that handles the events of the top level,
 * catching key, mouse... type of events directly from the specified HTML Element
 */
export class InputEventListener<C extends Node, P extends Node> extends Node<
  C,
  P
> {
  /** Needed to keep track of the used listeners, so they can be removed later */
  private readonly attachedListeners: [EventTypes, Function][] = [];
  /** HTML Element where the event handlers are listening to */
  private readonly eventTarget: HTMLElement;

  constructor(options: InputEventListenerOptions) {
    super();

    this.eventTarget = options.eventTarget;
    this.eventTarget.setAttribute('tabindex', '0');
    this.eventTarget.focus();

    this.handleMouseEvent = this.handleMouseEvent.bind(this);
    this.handleKeyEvent = this.handleKeyEvent.bind(this);
    this.handleNoDataEvents = this.handleNoDataEvents.bind(this);

    this.registerInputEventListeners(
      options.tileWidth,
      options.tileHeight,
      options.eventPreventDefault !== false,
      options.eventStopPropagation === true
    );
  }

  /**
   * Clear all the registered user-input event listeners to the target element
   */
  public clearInputEventListeners(): void {
    const { attachedListeners } = this;
    for (const [type, listener] of attachedListeners) {
      // tslint:disable-next-line: no-any
      this.eventTarget.removeEventListener(type, listener as any);
    }
    attachedListeners.splice(0, attachedListeners.length);
  }

  /**
   * Register one user-input event listener
   */
  private registerInputEventListener<K extends EventTypes>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void
  ): void {
    this.eventTarget.addEventListener(type, listener);
    this.attachedListeners.push([type, listener]);
  }

  /**
   * Register user-input event listeners to the passed target element
   * It clears the previous registered ones so there are no duplicated listeners
   */
  private registerInputEventListeners(
    tileWidth: number,
    tileHeight: number,
    preventDefault: boolean,
    stopPropagation: boolean
  ): void {
    this.clearInputEventListeners();

    // register mouse events
    const mouseEvents = [
      'click',
      'mousedown',
      'mouseenter',
      'mouseleave',
      'mousemove',
      'mouseout',
      'mouseover',
      'mouseup',
    ] as const;
    for (const type of mouseEvents) {
      // WHY typescript complains if I try a binding like with the key events? Q.Q
      this.registerInputEventListener(type, event => {
        this.handleMouseEvent(
          tileWidth,
          tileHeight,
          preventDefault,
          stopPropagation,
          type,
          event
        );
      });
    }

    // register key events
    for (const type of ['keydown', 'keyup', 'keypress'] as const) {
      this.registerInputEventListener(
        type,
        this.handleKeyEvent.bind(this, preventDefault, stopPropagation, type)
      );
    }

    // register blur, focus
    for (const type of ['blur', 'focus'] as const) {
      this.registerInputEventListener(
        type,
        this.handleNoDataEvents.bind(this, type)
      );
    }
  }

  /**
   * Emit mouse events
   */
  private handleMouseEvent(
    tileWidth: number,
    tileHeight: number,
    preventDefault: boolean,
    stopPropagation: boolean,
    type: MouseEventTypes,
    event: MouseEvent
  ): void {
    // if mouse events prevent defaults, can't get the focus clicking in the element
    // preventDefault && event.preventDefault();
    stopPropagation && event.stopPropagation();

    const param = {
      button: event.button,
      x: event.offsetX,
      y: event.offsetY,
      col: Math.floor(event.offsetX / tileWidth),
      row: Math.floor(event.offsetY / tileHeight),
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    };
    this.emit(type, param);
  }

  /**
   * Emit key events
   */
  private handleKeyEvent(
    preventDefault: boolean,
    stopPropagation: boolean,
    type: KeyEventTypes,
    event: KeyboardEvent
  ): void {
    preventDefault && event.preventDefault();
    stopPropagation && event.stopPropagation();

    const param = {
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
    };
    this.emit(type, param);
  }

  /**
   * Emit any kind of events without data
   */
  private handleNoDataEvents(type: NoDataEventTypes): void {
    this.emit(type);
  }
}
