import { describe, it } from 'mocha';
import { assert } from 'chai';
import { foobar } from '..';

describe('test boilerplate', () => {
  it('should pass ^^', () => {
    assert.isTrue(foobar());
  });
});
