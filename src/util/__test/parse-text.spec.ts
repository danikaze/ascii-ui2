import { describe, it } from 'mocha';
import { assert } from 'chai';
import { parseText, ParseTextOptions } from '../parse-text';
import { Tile } from '@src';
import { isArray } from 'vanilla-type-check/isArray';
import { extendObjectsOnly } from 'extend-objects-only';

const styleDefault = { fg: '#bbb' };
const styleRedFg = { fg: '#f00' };
const styleGreenFg = { fg: '#0f0' };
const styleYellowBg = { bg: '#ff0' };

function generateTiles(text: string, style?: Tile | Tile[]): Tile[] {
  const base = isArray(style) ? extendObjectsOnly({}, ...style) : style;

  return text.split('').map(char => ({ ...base, char }));
}

describe('parseText', () => {
  // tslint:disable: no-magic-numbers
  it('basic text', () => {
    const text = 'Basic text';
    const tiles = generateTiles(text, styleDefault);

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('manage new lines', () => {
    const text = 'First line\nSecond line\\nThird line';
    const tiles = [
      generateTiles('First line', styleDefault),
      generateTiles('Second line', styleDefault),
      generateTiles('Third line', styleDefault),
    ];

    assert.deepEqual(parseText(text), tiles);
  });

  it('basic format', () => {
    const text = 'White{fg:#f00}Red{/fg:#f00}white';
    const tiles = [
      ...generateTiles('White', styleDefault),
      ...generateTiles('Red', styleRedFg),
      ...generateTiles('white', styleDefault),
    ];

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('custom format', () => {
    const options: ParseTextOptions = {
      onTag: tag => {
        if (tag === 'fg-red') {
          return styleRedFg;
        }
      },
    };
    const text = 'White{fg-red}Red{/fg-red}white';
    const tiles = [
      ...generateTiles('White', styleDefault),
      ...generateTiles('Red', styleRedFg),
      ...generateTiles('white', styleDefault),
    ];

    assert.deepEqual(parseText(text, options), [tiles]);
  });

  it('custom default style', () => {
    const options: ParseTextOptions = {
      defaultStyle: styleRedFg,
    };
    const text = 'RED{bg:#ff0}Yellow bg{/bg:#ff0}red';
    const tiles = [
      ...generateTiles('RED', styleRedFg),
      ...generateTiles('Yellow bg', [styleRedFg, styleYellowBg]),
      ...generateTiles('red', styleRedFg),
    ];

    assert.deepEqual(parseText(text, options), [tiles]);
  });

  it('nested format', () => {
    const text =
      'WHITE{fg:#f00}red{fg:#0f0} green {/fg:#0f0}RED{/fg:#f00}white';
    const tiles = [
      ...generateTiles('WHITE', styleDefault),
      ...generateTiles('red', styleRedFg),
      ...generateTiles(' green ', styleGreenFg),
      ...generateTiles('RED', styleRedFg),
      ...generateTiles('white', styleDefault),
    ];

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('combined format', () => {
    const text = 'WHITE{fg:#f00}red{bg:#ff0}bg{/bg:#ff0}RED{/fg:#f00}white';
    const tiles = [
      ...generateTiles('WHITE', styleDefault),
      ...generateTiles('red', styleRedFg),
      ...generateTiles('bg', [styleRedFg, styleYellowBg]),
      ...generateTiles('RED', styleRedFg),
      ...generateTiles('white', styleDefault),
    ];

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('wrong (not-closed) tag', () => {
    const text = 'a{fg:#f00b';
    const tiles = generateTiles(text, styleDefault);

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('unmatched tag', () => {
    const text = 'a{fg:#f00}b';
    const tiles = generateTiles(text, styleDefault);

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('closing tag without opening one', () => {
    const text = 'a{/fg:#f00}b';
    const tiles = generateTiles(text, styleDefault);

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('double closing tag without opening one', () => {
    const text = 'a{fg:#f00}b{/fg:#f00}c{/fg:#f00}d';
    const tiles = [
      ...generateTiles('a', styleDefault),
      ...generateTiles('b', styleRedFg),
      ...generateTiles('c{/fg:#f00}d', styleDefault),
    ];

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('wrong order of closing tags', () => {
    const text = 'a{fg:#f00}b{bg:#ff0}c{/fg:#f00}d{/bg:#ff0}e';
    const tiles = [
      ...generateTiles('a', styleDefault),
      ...generateTiles('b', styleRedFg),
      ...generateTiles('c', [styleRedFg, styleYellowBg]),
      ...generateTiles('d{/bg:#ff0}e', styleDefault),
    ];

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('output escape char', () => {
    const text = 'a\\\\b';
    const tiles = generateTiles('a\\b', styleDefault);

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('output escaped tags', () => {
    const text = 'a\\{fg}b';
    const tiles = generateTiles('a{fg}b', styleDefault);

    assert.deepEqual(parseText(text), [tiles]);
  });

  it('should shape text within limits', () => {
    const options: ParseTextOptions = { width: 5 };
    const text = 'long text';
    const tiles = [
      generateTiles('long', styleDefault),
      generateTiles('text', styleDefault),
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('should manage double spaces', () => {
    const text = 'text  with  double  spaces';
    const tiles = [generateTiles(text, styleDefault)];

    assert.deepEqual(parseText(text), tiles);
  });

  it('should manage double spaces aligning text', () => {
    const options: ParseTextOptions = { width: 5 };
    const text = 'a  b  with  double  spaces';
    const tiles = [
      generateTiles('a  b', styleDefault),
      generateTiles('with', styleDefault),
      generateTiles('doubl', styleDefault),
      generateTiles('e', styleDefault),
      generateTiles('space', styleDefault),
      generateTiles('s', styleDefault),
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it(`split words not fitting in one line`, () => {
    const options: ParseTextOptions = { width: 4, hAlign: 'center' };
    const text = 'xx 1234567890 x';
    const tiles = [
      [
        ...generateTiles(' '),
        ...generateTiles('xx', styleDefault),
        ...generateTiles(' '),
      ],
      generateTiles('1234', styleDefault),
      generateTiles('5678', styleDefault),
      generateTiles('90 x', styleDefault),
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align left', () => {
    const options: ParseTextOptions = { width: 5, hAlign: 'left' };
    const text = 'long text';
    const tiles = [
      generateTiles('long', styleDefault),
      generateTiles('text', styleDefault),
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align center', () => {
    const options: ParseTextOptions = { width: 14, hAlign: 'center' };
    const text = 'should be aligned in the center';
    const tiles = [
      [
        ...generateTiles('  '),
        ...generateTiles('should be', styleDefault),
        ...generateTiles('   '),
      ],
      [...generateTiles('aligned in the', styleDefault)],
      [
        ...generateTiles('    '),
        ...generateTiles('center', styleDefault),
        ...generateTiles('    '),
      ],
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align right', () => {
    const options: ParseTextOptions = { width: 14, hAlign: 'right' };
    const text = 'should be right-aligned';
    const tiles = [
      [...generateTiles('     '), ...generateTiles('should be', styleDefault)],
      [...generateTiles(' '), ...generateTiles('right-aligned', styleDefault)],
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align top-left', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'left',
      vAlign: 'top',
    };
    const text = 'x';
    const tiles = [generateTiles('x', styleDefault)];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align top-center', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'center',
      vAlign: 'top',
    };
    const text = 'x';
    const tiles = [
      [
        ...generateTiles(' '),
        ...generateTiles('x', styleDefault),
        ...generateTiles(' '),
      ],
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align top-right', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'right',
      vAlign: 'top',
    };
    const text = 'x';
    const tiles = [
      [...generateTiles('  '), ...generateTiles('x', styleDefault)],
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align center-left', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'left',
      vAlign: 'center',
    };
    const text = 'x';
    const tiles = [
      generateTiles('   '),
      generateTiles('x', styleDefault),
      generateTiles('   '),
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align center-center', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'center',
      vAlign: 'center',
    };
    const text = 'x';
    const tiles = [
      generateTiles('   '),
      [
        ...generateTiles(' '),
        ...generateTiles('x', styleDefault),
        ...generateTiles(' '),
      ],
      generateTiles('   '),
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align center-right', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'right',
      vAlign: 'center',
    };
    const text = 'x';
    const tiles = [
      generateTiles('   '),
      [...generateTiles('  '), ...generateTiles('x', styleDefault)],
      generateTiles('   '),
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align bottom-left', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'left',
      vAlign: 'bottom',
    };
    const text = 'x';
    const tiles = [
      generateTiles('   '),
      generateTiles('   '),
      generateTiles('x', styleDefault),
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align bottom-center', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'center',
      vAlign: 'bottom',
    };
    const text = 'x';
    const tiles = [
      generateTiles('   '),
      generateTiles('   '),
      [
        ...generateTiles(' '),
        ...generateTiles('x', styleDefault),
        ...generateTiles(' '),
      ],
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align bottom-right', () => {
    const options: ParseTextOptions = {
      width: 3,
      height: 3,
      hAlign: 'right',
      vAlign: 'bottom',
    };
    const text = 'x';
    const tiles = [
      generateTiles('   '),
      generateTiles('   '),
      [...generateTiles('  '), ...generateTiles('x', styleDefault)],
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });

  it('align text lines even if no width is specified', () => {
    const options: ParseTextOptions = { hAlign: 'right' };
    const text = '123\n45';
    const tiles = [
      generateTiles('123', styleDefault),
      [...generateTiles(' '), ...generateTiles('45', styleDefault)],
    ];

    assert.deepEqual(parseText(text, options), tiles);
  });
});
