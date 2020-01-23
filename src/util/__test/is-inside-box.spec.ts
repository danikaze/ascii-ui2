import { describe, it } from 'mocha';
import { assert } from 'chai';
import { isInsideBox } from '../is-inside-box';

describe('isInsideBox', () => {
  // tslint:disable:no-magic-numbers
  it('Should return true when a point is inside the box', () => {
    assert.isTrue(isInsideBox(2, 2, 0, 0, 4, 4));
  });

  it('Should return true when a point in any of the box borders', () => {
    assert.isTrue(isInsideBox(0, 2, 0, 0, 4, 4));
    assert.isTrue(isInsideBox(4, 2, 0, 0, 4, 4));
    assert.isTrue(isInsideBox(2, 0, 0, 0, 4, 4));
    assert.isTrue(isInsideBox(2, 4, 0, 0, 4, 4));
  });

  it('Should return true when a point in any of corners', () => {
    assert.isTrue(isInsideBox(0, 0, 0, 0, 4, 4));
    assert.isTrue(isInsideBox(4, 0, 0, 0, 4, 4));
    assert.isTrue(isInsideBox(0, 4, 0, 0, 4, 4));
    assert.isTrue(isInsideBox(4, 4, 0, 0, 4, 4));
  });

  it('Should return true even if the box has size 0x0', () => {
    assert.isTrue(isInsideBox(1, 1, 1, 1, 1, 1));
  });

  it('Should return false when a point is in any place around the box', () => {
    assert.isFalse(isInsideBox(-1, 2, 0, 0, 4, 4)); // left
    assert.isFalse(isInsideBox(6, 2, 0, 0, 4, 4)); // right
    assert.isFalse(isInsideBox(2, -1, 0, 0, 4, 4)); // top
    assert.isFalse(isInsideBox(2, 6, 0, 0, 4, 4)); // bottom
    assert.isFalse(isInsideBox(-1, -1, 0, 0, 4, 4)); // top-left
    assert.isFalse(isInsideBox(6, -1, 0, 0, 4, 4)); // top-right
    assert.isFalse(isInsideBox(-1, 6, 0, 0, 4, 4)); // bottom-left
    assert.isFalse(isInsideBox(6, 6, 0, 0, 4, 4)); // bottom-right
  });

  it('Should return false when a point is inside a "reversed" box', () => {
    assert.isFalse(isInsideBox(0, 2, 4, 4, 0, 0));
  });
});
