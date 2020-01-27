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

export interface NodeCanvasOptions {
  /** Associated canvas where to listen to */
  canvas: HTMLCanvasElement;
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
export class NodeCanvas<C extends Node, P extends Node> extends Node<C, P> {
  constructor(options: NodeCanvasOptions) {
    super();

    const { canvas, tileWidth, tileHeight } = options;
    const handleMouseEvent = this.handleMouseEvent.bind(
      this,
      tileWidth,
      tileHeight
    );

    canvas.setAttribute('tabindex', '0');
    canvas.focus();

    // register mouse events
    canvas.addEventListener('click', handleMouseEvent.bind(this, 'click'));
    canvas.addEventListener(
      'mousedown',
      handleMouseEvent.bind(this, 'mousedown')
    );
    canvas.addEventListener(
      'mouseenter',
      handleMouseEvent.bind(this, 'mouseenter')
    );
    canvas.addEventListener(
      'mouseleave',
      handleMouseEvent.bind(this, 'mouseleave')
    );
    canvas.addEventListener(
      'mousemove',
      handleMouseEvent.bind(this, 'mousemove')
    );
    canvas.addEventListener(
      'mouseout',
      handleMouseEvent.bind(this, 'mouseout')
    );
    canvas.addEventListener(
      'mouseover',
      handleMouseEvent.bind(this, 'mouseover')
    );
    canvas.addEventListener('mouseup', handleMouseEvent.bind(this, 'mouseup'));

    // register key events
    canvas.addEventListener('keydown', this.handleKeys.bind(this, 'keydown'));
    canvas.addEventListener('keyup', this.handleKeys.bind(this, 'keyup'));
    canvas.addEventListener('keypress', this.handleKeys.bind(this, 'keypress'));

    // blur, focus
    canvas.addEventListener(
      'focus',
      this.handleNoDataEvents.bind(this, 'focus')
    );
    canvas.addEventListener('blur', this.handleNoDataEvents.bind(this, 'blur'));
  }

  /**
   * Emit mouse events
   */
  private handleMouseEvent(
    tileWidth: number,
    tileHeight: number,
    type: MouseEventTypes,
    event: MouseEvent
  ): void {
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
  private handleKeys(type: KeyEventTypes, event: KeyboardEvent): void {
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
