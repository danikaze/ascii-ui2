// tslint:disable: no-magic-numbers
import * as puppeteer from 'puppeteer';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { Buffer } from '@src/buffer';
import { TestCases, TestDescription } from '@test';
import { BufferKeyEvent, BufferMouseEvent } from '@src/node-canvas';

type EventHandlerSpy = sinon.SinonSpy<unknown[], void>;
interface EventTestWindow extends Window {
  getListener: (type: string) => EventHandlerSpy;
}
interface BufferTestInfo {
  bufferWidth: number;
  bufferHeight: number;
  tileWidth: number;
  tileHeight: number;
}

let buffer: Buffer;
const listeners: { [type: string]: EventHandlerSpy } = {};

/**
 * Get a Sinon Spy for the listener of a specified event type
 */
function getListener(type: string, reset?: boolean): EventHandlerSpy {
  if (!listeners[type] || reset) {
    listeners[type] = sinon.spy((...args) => {
      // tslint:disable: no-console
      console.log(type, ...args);
    });
  }

  return listeners[type];
}

/**
 * Get a list of the arguments of all the calls made to a listener of an specific event type
 */
function getBrowserListenerArgs<E>(
  page: puppeteer.Page,
  eventType: string
): Promise<E[][]> {
  return page.evaluate(
    eventType =>
      ((window as unknown) as EventTestWindow).getListener(eventType)
        .args as E[][],
    eventType
  );
}

export const data: TestCases<BufferTestInfo> = [
  {
    description: 'All possible listeners are registered',
    test: ({ canvas }) => {
      // need to register it in window because the evaluated functions from puppeteer
      // run in a different context than this ones
      ((window as unknown) as EventTestWindow).getListener = getListener;

      buffer = new Buffer({
        canvas,
        cols: 5,
        rows: 5,
      });

      [
        'click',
        'mousedown',
        'mouseup',
        'mouseenter',
        'mouseleave',
        'mousemove',
        'mouseout',
        'mouseover',
        'keydown',
        'keyup',
        'keypress',
        'focus',
        'blur',
      ].forEach(eventType => buffer.on(eventType, getListener(eventType)));
    },
  },
  {
    description: '<click | mousedown | mouseup> listeners',
    test: () => {
      buffer.clearListeners();
      buffer.on('click', getListener('click'));
      buffer.on('mousedown', getListener('mousedown'));
      buffer.on('mouseup', getListener('mouseup'));

      return {
        bufferWidth: buffer.width,
        bufferHeight: buffer.height,
        tileWidth: buffer.tileWidth,
        tileHeight: buffer.tileHeight,
      } as BufferTestInfo;
    },
    afterTest: async ({
      page,
      canvasHandler,
      getBounds,
      bufferWidth,
      bufferHeight,
      tileWidth,
      tileHeight,
    }) => {
      const bounds = await getBounds(canvasHandler);
      let nClicks = 0;

      // click on the corners
      await page.mouse.click(bounds.x, bounds.y);
      await page.mouse.click(
        bounds.x + bounds.width - 1,
        bounds.y + bounds.height - 1
      );
      nClicks += 2;

      // click on each buffer tile
      for (let row = 0; row < bufferHeight; row++) {
        for (let col = 0; col < bufferWidth; col++) {
          nClicks++;
          await page.mouse.click(
            bounds.x + tileWidth * col + tileWidth / 2,
            bounds.y + tileHeight * row + tileHeight / 2
          );
        }
      }

      // get all the arguments received by the listener
      const clickCalls = await getBrowserListenerArgs<BufferMouseEvent>(
        page,
        'click'
      );
      const mousedownCalls = await getBrowserListenerArgs<BufferMouseEvent>(
        page,
        'mousedown'
      );
      const mouseupCalls = await getBrowserListenerArgs<BufferMouseEvent>(
        page,
        'mouseup'
      );

      assert.lengthOf(clickCalls, nClicks);
      assert.lengthOf(mousedownCalls, nClicks);
      assert.lengthOf(mouseupCalls, nClicks);

      // check the received events
      const checkEventData = (
        event: BufferMouseEvent,
        x: number,
        y: number,
        col: number,
        row: number
      ) => {
        assert.equal(event.button, 0);
        assert.isFalse(event.altKey);
        assert.isFalse(event.ctrlKey);
        assert.isFalse(event.shiftKey);
        assert.isFalse(event.metaKey);
        assert.equal(event.x, x);
        assert.equal(event.y, y);
        assert.equal(event.col, col);
        assert.equal(event.row, row);
      };

      // check clicks in the corners
      checkEventData(clickCalls[0][0], 0, 0, 0, 0);
      checkEventData(mouseupCalls[0][0], 0, 0, 0, 0);
      checkEventData(mousedownCalls[0][0], 0, 0, 0, 0);

      const x = bounds.width - 1;
      const y = bounds.height - 1;
      const col = bufferWidth - 1;
      const row = bufferHeight - 1;
      checkEventData(clickCalls[1][0], x, y, col, row);
      checkEventData(mouseupCalls[1][0], x, y, col, row);
      checkEventData(mousedownCalls[1][0], x, y, col, row);

      // check click in each row
      let call = 2;
      for (let row = 0; row < bufferHeight; row++) {
        for (let col = 0; col < bufferWidth; col++) {
          const x = tileWidth * col + tileWidth / 2;
          const y = tileHeight * row + tileHeight / 2;
          checkEventData(clickCalls[call][0], x, y, col, row);
          checkEventData(mouseupCalls[call][0], x, y, col, row);
          checkEventData(mousedownCalls[call][0], x, y, col, row);
          call++;
        }
      }
    },
  } as TestDescription<BufferTestInfo>,
  {
    description: '<keydown | keyup | keypress> listeners',
    test: () => {
      buffer.clearListeners();
      buffer.on('keydown', getListener('keydown'));
      buffer.on('keyup', getListener('keyup'));
      buffer.on('keypress', getListener('keypress'));
    },
    afterTest: async ({ page, canvasHandler }) => {
      await canvasHandler.asElement()!.type('abc');

      const keydownCalls = await getBrowserListenerArgs<BufferKeyEvent>(
        page,
        'keydown'
      );
      const keyupCalls = await getBrowserListenerArgs<BufferKeyEvent>(
        page,
        'keyup'
      );
      const keypressCalls = await getBrowserListenerArgs<BufferKeyEvent>(
        page,
        'keypress'
      );

      const nCalls = 3;
      assert.lengthOf(keydownCalls, nCalls);
      assert.lengthOf(keyupCalls, nCalls);
      assert.lengthOf(keypressCalls, nCalls);

      // check the received events
      const checkEventData = (
        event: BufferKeyEvent,
        key: string,
        code: string,
        keyCode: number
      ) => {
        assert.isFalse(event.altKey);
        assert.isFalse(event.ctrlKey);
        assert.isFalse(event.shiftKey);
        assert.isFalse(event.metaKey);
        assert.equal(event.key, key);
        assert.equal(event.code, code);
        assert.equal(event.keyCode, keyCode);
      };

      // "funny" but the keyCode for keyup/keydown is different than for keypress
      const expectedEventData = [
        { key: 'a', code: 'KeyA', keyCode: 65, keyPressCode: 97 },
        { key: 'b', code: 'KeyB', keyCode: 66, keyPressCode: 98 },
        { key: 'c', code: 'KeyC', keyCode: 67, keyPressCode: 99 },
      ];

      expectedEventData.forEach((data, i) => {
        checkEventData(keydownCalls[i][0], data.key, data.code, data.keyCode);
        checkEventData(keyupCalls[i][0], data.key, data.code, data.keyCode);
        checkEventData(
          keypressCalls[i][0],
          data.key,
          data.code,
          data.keyPressCode
        );
      });
    },
  },
  {
    description: '<focus | blur> listeners',
    beforeTest: async ({ page, canvasHandler, getBounds }) => {
      // start with the canvas without focus
      const bounds = await getBounds(canvasHandler);
      page.mouse.click(bounds.x - 1, bounds.y - 1);
    },
    test: () => {
      buffer.clearListeners();
      buffer.on('focus', getListener('focus', true));
      buffer.on('blur', getListener('blur', true));
    },
    afterTest: async ({ page, canvasHandler, getBounds }) => {
      const bounds = await getBounds(canvasHandler);
      // focus
      page.mouse.click(bounds.x + 1, bounds.y + 1);
      // blur
      page.mouse.click(bounds.x - 1, bounds.y - 1);

      const focusCalls = await getBrowserListenerArgs<BufferKeyEvent>(
        page,
        'focus'
      );
      const blurCalls = await getBrowserListenerArgs<BufferKeyEvent>(
        page,
        'blur'
      );

      assert.lengthOf(focusCalls, 1);
      assert.lengthOf(blurCalls, 1);
    },
  },
];
