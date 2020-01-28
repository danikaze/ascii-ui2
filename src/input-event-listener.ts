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
  /** Associated canvas where to listen to */
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

/**
 * Special type of Node that handles the events of the top level,
 * catching key, mouse... type of events directly from the canvas
 */
export class InputEventListener<C extends Node, P extends Node> extends Node<
  C,
  P
> {
  constructor(options: InputEventListenerOptions) {
    super();

    const {
      eventTarget,
      tileWidth,
      tileHeight,
      eventPreventDefault,
      eventStopPropagation,
    } = options;

    const handleMouseEvent = this.handleMouseEvent.bind(
      this,
      tileWidth,
      tileHeight,
      eventPreventDefault !== false,
      eventStopPropagation === true
    );
    const handleKeyEvent = this.handleKeyEvent.bind(
      this,
      eventPreventDefault !== false,
      eventStopPropagation === true
    );

    eventTarget.setAttribute('tabindex', '0');
    eventTarget.focus();

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
      eventTarget.addEventListener(type, handleMouseEvent.bind(this, type));
    }

    // register key events
    for (const type of ['keydown', 'keyup', 'keypress'] as const) {
      eventTarget.addEventListener(type, handleKeyEvent.bind(this, type));
    }

    // blur, focus
    for (const type of ['blur', 'focus'] as const) {
      eventTarget.addEventListener(
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
    // preventDefault && event.preventDefault(); // if mouse events prevent defaults, can't get the focus
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
