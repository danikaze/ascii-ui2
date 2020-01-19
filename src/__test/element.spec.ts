import { describe, it } from 'mocha';
import { assert } from 'chai';
import { Element } from '../element';

describe('Element', () => {
  it('Create a basic Element with default options', () => {
    const element = new Element();

    assert.equal(element.getX(), 0);
    assert.equal(element.getY(), 0);
    assert.equal(element.getWidth(), 0);
    assert.equal(element.getHeight(), 0);
    assert.deepEqual(element.getBounds(), {
      col0: 0,
      row0: 0,
      // yes, an element with no size, has its final coords lesser than the initial ones
      col1: -1,
      row1: -1,
    });
  });

  it('Create a basic Element with options', () => {
    const x = 10;
    const y = 5;
    const width = 7;
    const height = 9;
    const element = new Element({
      x,
      y,
      width,
      height,
    });

    assert.equal(element.getX(), x);
    assert.equal(element.getY(), y);
    assert.equal(element.getWidth(), width);
    assert.equal(element.getHeight(), height);
    assert.deepEqual(element.getBounds(), {
      col0: x,
      row0: y,
      col1: x + width - 1,
      row1: y + height - 1,
    });
  });

  it(`Position should be relative to its parent's`, () => {
    const parent = new Element({ x: 5, y: 10 });
    const element = new Element({ x: 2, y: 3, width: 5, height: 6 });

    // tslint:disable: no-magic-numbers
    assert.equal(element.getX(), 2);
    assert.equal(element.getY(), 3);
    assert.deepEqual(element.getBounds(), {
      col0: 2,
      row0: 3,
      col1: 6,
      row1: 8,
    });

    parent.append(element);

    assert.equal(element.getX(), 2);
    assert.equal(element.getY(), 3);
    assert.deepEqual(element.getBounds(), {
      col0: 7,
      row0: 13,
      col1: 11,
      row1: 18,
    });

    parent.move(1, 1);
    assert.equal(element.getX(), 2);
    assert.equal(element.getY(), 3);
    assert.deepEqual(element.getBounds(), {
      col0: 8,
      row0: 14,
      col1: 12,
      row1: 19,
    });
  });

  it(`Should stop tracking parent's position when dettached`, () => {
    const element = new Element({ x: 2, y: 3, width: 5, height: 6 });
    const parent = new Element({ x: 5, y: 10, children: [element] });

    assert.equal(element.getX(), 2);
    assert.equal(element.getY(), 3);
    assert.deepEqual(element.getBounds(), {
      col0: 7,
      row0: 13,
      col1: 11,
      row1: 18,
    });

    parent.remove(element);
    parent.move(4, 4);

    assert.deepEqual(element.getBounds(), {
      col0: 7,
      row0: 13,
      col1: 11,
      row1: 18,
    });
  });

  it('Moving the element', () => {
    const element = new Element({ width: 5, height: 6 });
    assert.equal(element.getX(), 0);
    assert.equal(element.getY(), 0);
    assert.deepEqual(element.getBounds(), {
      col0: 0,
      row0: 0,
      col1: 4,
      row1: 5,
    });

    element.move(1, 2);
    assert.equal(element.getX(), 1);
    assert.equal(element.getY(), 2);
    assert.deepEqual(element.getBounds(), {
      col0: 1,
      row0: 2,
      col1: 5,
      row1: 7,
    });

    element.setX(10);
    assert.equal(element.getX(), 10);
    assert.equal(element.getY(), 2);
    assert.deepEqual(element.getBounds(), {
      col0: 10,
      row0: 2,
      col1: 14,
      row1: 7,
    });

    element.setY(5);
    assert.equal(element.getX(), 10);
    assert.equal(element.getY(), 5);
    assert.deepEqual(element.getBounds(), {
      col0: 10,
      row0: 5,
      col1: 14,
      row1: 10,
    });
  });

  it('Resizing the element', () => {
    const element = new Element();

    assert.equal(element.getWidth(), 0);
    assert.equal(element.getHeight(), 0);
    assert.deepEqual(element.getBounds(), {
      col0: 0,
      row0: 0,
      col1: -1,
      row1: -1,
    });

    element.resize(2, 3);
    assert.equal(element.getWidth(), 2);
    assert.equal(element.getHeight(), 3);
    assert.deepEqual(element.getBounds(), {
      col0: 0,
      row0: 0,
      col1: 1,
      row1: 2,
    });

    element.setWidth(5);
    assert.equal(element.getWidth(), 5);
    assert.equal(element.getHeight(), 3);
    assert.deepEqual(element.getBounds(), {
      col0: 0,
      row0: 0,
      col1: 4,
      row1: 2,
    });

    element.setHeight(8);
    assert.equal(element.getWidth(), 5);
    assert.equal(element.getHeight(), 8);
    assert.deepEqual(element.getBounds(), {
      col0: 0,
      row0: 0,
      col1: 4,
      row1: 7,
    });
  });
});
