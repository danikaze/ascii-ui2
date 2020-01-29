import { describe, it } from 'mocha';
import { assert } from 'chai';
import {
  inputMatch,
  InputDefinition,
  KeyEventData,
  MouseEventData,
} from '../user-input';

describe('inputMatch', () => {
  const eventA: KeyEventData = {
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    key: 'a',
    code: 'KeyA',
    keyCode: 65,
  };

  const eventShiftA: KeyEventData = {
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    key: 'a',
    code: 'KeyA',
    keyCode: 65,
  };

  const eventCtrlC: KeyEventData = {
    shiftKey: false,
    ctrlKey: true,
    altKey: false,
    metaKey: false,
    key: 'c',
    code: 'KeyC',
    keyCode: 67,
  };

  const eventLeftButtonClick: MouseEventData = {
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    button: 0,
  };

  const eventLeftButtonAltClick: MouseEventData = {
    shiftKey: false,
    ctrlKey: false,
    altKey: true,
    metaKey: false,
    button: 0,
  };

  const defA: InputDefinition = { key: 'a' };
  const defNoShiftA: InputDefinition = { keyCode: 65, shiftKey: false };
  const defCtrlC: InputDefinition = { code: 'KeyC', ctrlKey: true };
  const defMetaShiftTab: InputDefinition = {
    key: 'Tab',
    shiftKey: true,
    metaKey: true,
  };
  const defLeftClick: InputDefinition = { button: 0 };
  const defLeftAltClick: InputDefinition = { button: 0, altKey: true };

  it('Empty definitions match always', () => {
    assert.isTrue(inputMatch({}, eventA));
    assert.isTrue(inputMatch({}, eventShiftA));
    assert.isTrue(inputMatch({}, eventCtrlC));

    assert.isTrue(inputMatch({}, eventLeftButtonClick));
    assert.isTrue(inputMatch({}, eventLeftButtonAltClick));
    assert.isTrue(inputMatch({}, eventLeftButtonAltClick));
    assert.isTrue(inputMatch({}, eventLeftButtonClick));
  });

  it('Should match basic input', () => {
    assert.isTrue(inputMatch(defA, eventA));
    assert.isTrue(inputMatch(defA, eventShiftA));
    assert.isFalse(inputMatch(defNoShiftA, eventShiftA));
    assert.isTrue(inputMatch(defCtrlC, eventCtrlC));
    assert.isFalse(inputMatch(defMetaShiftTab, eventShiftA));

    assert.isTrue(inputMatch(defLeftClick, eventLeftButtonClick));
    assert.isTrue(inputMatch(defLeftClick, eventLeftButtonAltClick));
    assert.isTrue(inputMatch(defLeftAltClick, eventLeftButtonAltClick));
    assert.isFalse(inputMatch(defLeftAltClick, eventLeftButtonClick));
  });

  it('Should match one input of the list', () => {
    assert.isTrue(inputMatch([defA, defNoShiftA], eventA));
    assert.isTrue(inputMatch([defA, defNoShiftA], eventShiftA));
    assert.isTrue(inputMatch([defA, defNoShiftA], eventShiftA));
    assert.isFalse(inputMatch([defA, defNoShiftA], eventCtrlC));

    assert.isTrue(
      inputMatch([defLeftClick, defLeftAltClick], eventLeftButtonClick)
    );
    assert.isTrue(
      inputMatch([defLeftClick, defLeftAltClick], eventLeftButtonAltClick)
    );
  });

  it('Should accept mixed events lists', () => {
    assert.isTrue(inputMatch([defA, defLeftClick], eventA));
    assert.isTrue(inputMatch([defA, defLeftClick], eventLeftButtonClick));
  });
});
