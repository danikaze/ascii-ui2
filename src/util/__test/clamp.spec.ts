import { describe, it } from 'mocha';
import { assert } from 'chai';
import { clamp } from '../clamp';

describe('clamp', () => {
  // tslint:disable:no-magic-numbers
  it('should clamp between [min, max]', () => {
    // value ok
    assert.equal(clamp(0, -100, 100), 0);

    // min = max
    assert.equal(clamp(0, 100, 100), 100);
    // max = min
    assert.equal(clamp(0, -100, -100), -100);

    // value > max
    assert.equal(clamp(100, 0, 50), 50);
    // value < min
    assert.equal(clamp(50, 100, 150), 100);

    // value = max
    assert.equal(clamp(50, 0, 50), 50);
    // value = min
    assert.equal(clamp(100, 100, 150), 100);
  });

  it('should clamp between [max, min] too', () => {
    // value ok
    assert.equal(clamp(0, 100, -100), 0);

    // min = max
    assert.equal(clamp(0, 100, 100), 100);
    // max = min
    assert.equal(clamp(0, -100, -100), -100);

    // value > max
    assert.equal(clamp(100, 50, 0), 50);
    // value < min
    assert.equal(clamp(50, 150, 100), 100);

    // value = max
    assert.equal(clamp(50, 50, 0), 50);
    // value = min
    assert.equal(clamp(100, 150, 100), 100);
  });
});
