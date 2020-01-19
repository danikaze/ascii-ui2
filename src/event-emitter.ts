import * as EventEmitter3 from 'eventemitter3';

export interface BufferMouseEvent {
  button: number;
  x: number;
  y: number;
  col: number;
  row: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface BufferKeyEvent {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface Events {
  click: BufferMouseEvent;
  mousedown: BufferMouseEvent;
  mouseenter: BufferMouseEvent;
  mouseleave: BufferMouseEvent;
  mousemove: BufferMouseEvent;
  mouseout: BufferMouseEvent;
  mouseover: BufferMouseEvent;
  mouseup: BufferMouseEvent;
  keydown: BufferKeyEvent;
  keyup: BufferKeyEvent;
  keypress: BufferKeyEvent;
  focus: never;
  blur: never;
}

export interface EventEmitterRootOptions {
  canvas: HTMLCanvasElement;
  tileWidth: number;
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

export class EventEmitter extends EventEmitter3<keyof Events> {
  constructor(options?: EventEmitterRootOptions) {
    super();
    if (!options) return;

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
  protected handleMouseEvent(
    tileWidth: number,
    tileHeight: number,
    type: MouseEventTypes,
    event: MouseEvent
  ): void {
    this.emit(type, {
      button: event.button,
      x: event.offsetX,
      y: event.offsetY,
      col: Math.floor(event.offsetX / tileWidth),
      row: Math.floor(event.offsetY / tileHeight),
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    });
  }

  /**
   * Emit key events
   */
  protected handleKeys(type: KeyEventTypes, event: KeyboardEvent): void {
    this.emit(type, {
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
    });
  }

  /**
   * Emit any kind of events without data
   */
  protected handleNoDataEvents(type: NoDataEventTypes): void {
    this.emit(type);
  }
}
