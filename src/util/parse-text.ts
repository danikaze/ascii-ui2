import { Tile } from '@src';
import { Colors } from '@src/widgets/constants';

export type TextHorizontalAlignment = 'left' | 'center' | 'right';
export type TextVerticalAlignment = 'top' | 'center' | 'bottom';

export interface ParseTextOptions {
  /** Number of columns to use for the resulting text */
  width?: number;
  /** Number of rows to use for the resulting text */
  height?: number;
  /** Horizontal text alignment (`left` by default) */
  hAlign?: TextHorizontalAlignment;
  /** Vertical text alignment (`top` by default) */
  vAlign?: TextVerticalAlignment;
  /** Style to use for the text by default */
  defaultStyle?: Tile;
  /** Format tag open character (`{` by default) */
  tagOpen?: string;
  /** Format tag close character (`}` by default) */
  tagClose?: string;
  /** End tag character ('/' by default) */
  endTag?: string;
  /** Escape character ('\' by default) */
  escapeChar?: string;
  /** Characters to consider non-words (`/\s+/` by default) */
  separators?: RegExp;
  /** Style to use for empty tiles when aligning text */
  filler?: Tile;
  /** Allow to pass custom tag processing */
  onTag?: (tag: string) => Tile | void;
}

type FormatTextOptions = Required<
  Pick<
    ParseTextOptions,
    'defaultStyle' | 'tagOpen' | 'tagClose' | 'endTag' | 'escapeChar'
  >
> &
  Pick<ParseTextOptions, 'onTag'>;
type SplitTextOptions = Pick<ParseTextOptions, 'width'> & {
  separators: RegExp;
};
type AlignTextOptions = Pick<ParseTextOptions, 'width' | 'height'> &
  Required<Pick<ParseTextOptions, 'hAlign' | 'vAlign' | 'filler'>>;

const DEFAULT_STYLE: Tile = {
  fg: Colors.fg,
};

/**
 * Given a text, format it into an (optional) box applying styles
 * The box will be completelly filled even if the there's no text
 */
export function parseText(text: string, options?: ParseTextOptions): Tile[][] {
  const opt = {
    defaultStyle: DEFAULT_STYLE,
    tagOpen: '{',
    tagClose: '}',
    escapeChar: '\\',
    endTag: '/',
    hAlign: 'left' as TextHorizontalAlignment,
    vAlign: 'top' as TextVerticalAlignment,
    separators: /\s+/,
    filler: { char: ' ' },
    ...options!,
  };

  let result = formatText(text, opt);
  result = splitText(result, opt);
  return alignText(result, opt);
}

/**
 * Given a text, parse it and format it into Tile objects
 * It also replaces \n and split it into lines
 */
function formatText(text: string, options: FormatTextOptions): Tile[][] {
  const {
    tagOpen,
    tagClose,
    endTag,
    escapeChar,
    defaultStyle,
    onTag,
  } = options;
  const formattedText: Tile[][] = [];
  let line = [];
  const styles = [defaultStyle];
  const openTags: string[] = [];
  let isEscaped = false;

  let i = 0;
  while (i < text.length) {
    const char = text[i];

    if (char === escapeChar && !isEscaped) {
      isEscaped = true;
      i++;
      continue;
    }

    // process line breaks
    if ((isEscaped && char === 'n') || char === '\n') {
      isEscaped = false;
      i++;
      formattedText.push(line);
      line = [];
      continue;
    }

    if (char === tagOpen && !isEscaped) {
      const closeTagIndex = text.indexOf(tagClose, i + 1);
      // if there's no closing tag, it's just the character alone
      if (closeTagIndex === -1) {
        line.push({ ...styles[0], char });
        i++;
        continue;
      }

      let tag = text.substring(i + 1, closeTagIndex);

      // if it's the closing tag
      if (tag[0] === endTag) {
        tag = tag.substring(endTag.length);
        // try to close tags, skipping all the non-closed tags until now...
        const openTagIndex = openTags.indexOf(tag);
        // if not found, consider it like normal text
        if (openTagIndex === -1) {
          line.push({ ...styles[0], char });
          i++;
          continue;
        }
        styles.splice(0, openTagIndex + 1);
        openTags.splice(0, openTagIndex + 1);
        i += tagOpen.length + endTag.length + tag.length + tagClose.length;
        continue;
      }

      const matchingTagIndex = text.indexOf(
        `${tagOpen}${endTag}${tag}${tagClose}`,
        closeTagIndex + 1
      );

      // if there's no matching tag, consider it like normal text
      if (matchingTagIndex === -1) {
        line.push({ ...styles[0], char });
        i++;
        continue;
      }

      // if it's a correct opening tag
      openTags.unshift(tag);
      const style = {
        ...styles[0],
        ...((onTag && onTag(tag)) || getTagStyle(tag)),
      };
      styles.unshift(style);
      i += tagOpen.length + tag.length + tagClose.length;
      continue;
    }

    // normal character case
    isEscaped = false;
    line.push({ ...styles[0], char });
    i++;
  }

  formattedText.push(line);
  return formattedText;
}

/**
 * Get the style Tile for the specified tag
 */
function getTagStyle(tag: string): Tile {
  const [type, value] = tag.split(':');

  return {
    [type]: value,
  } as Tile;
}

/**
 * Given a text in tiles, split it into several lines.
 * Spaces are ignored at the beginning and end of the line, but preserved
 * between words (even double ones)
 */
function splitText(text: Tile[][], options: SplitTextOptions): Tile[][] {
  const { width, separators } = options;
  const splitText: Tile[][] = [];
  let line: Tile[] = [];
  let word: Tile[] = [];
  let spaces: Tile[] = [];

  function pushNewWord(): void {
    if (
      !width ||
      line.length + (line.length ? spaces.length : 0) + word.length <= width
    ) {
      // if the content fits, push it
      if (line.length) {
        line.push(...spaces);
      }
      line.push(...word);
    } else if (word.length > width) {
      // if the content is too long, split it in several lines
      splitText.push(line);
      line = [];

      let start = 0;
      let end = width - line.length;
      line.push(...word.slice(start, end));
      splitText.push(line);

      while (end < word.length) {
        start = end;
        end = Math.min(start + width, word.length);
        line = [...word.slice(start, end)];
        if (line.length === width) {
          splitText.push(line);
        }
      }
    } else {
      // if the content doesn't fit, push it in the next line
      splitText.push(line);
      line = [...word];
    }
    spaces = [];
    word = [];
  }

  for (const row of text) {
    for (const tile of row) {
      // non-space: add it to the current word
      if (!separators.test(tile.char!)) {
        word.push(tile);
        continue;
      }
      // space:
      if (word.length > 0) {
        pushNewWord();
      }
      spaces.push(tile);
    }
    pushNewWord();
    splitText.push(line);
    line = [];
  }

  return splitText;
}

/**
 * Given a text in several lines, align it vertically and horizontally
 */
function alignText(text: Tile[][], options: AlignTextOptions): Tile[][] {
  const { width, height, hAlign, vAlign, filler } = options;
  let availableWidth: number;

  // align horizontally
  if (!width) {
    if (text.length === 1) return text;
    availableWidth = text.reduce((w, line) => Math.max(w, line.length), 0);
  } else {
    availableWidth = width;
  }

  if (hAlign === 'left') {
    for (const row of text) {
      for (let i = row.length; i < availableWidth; i++) {
        row.push(filler);
      }
    }
  } else if (hAlign === 'center') {
    for (const row of text) {
      const left = Math.floor((availableWidth - row.length) / 2);
      const right = availableWidth - row.length - left;
      for (let i = 0; i < left; i++) {
        row.unshift(filler);
      }
      for (let i = 0; i < right; i++) {
        row.push(filler);
      }
    }
  } /*(hAlign === 'right')*/ else {
    for (const row of text) {
      for (let i = row.length; i < availableWidth; i++) {
        row.unshift(filler);
      }
    }
  }

  // align vertically
  if (!height) return text;
  const emptyLine: Tile[] = [];
  for (let i = 0; i < availableWidth; i++) {
    emptyLine.push(filler);
  }

  if (vAlign === 'top') {
    for (let i = text.length; i < availableWidth; i++) {
      text.push(emptyLine);
    }
  } else if (vAlign === 'center') {
    const top = Math.floor((height - text.length) / 2);
    const bottom = height - text.length - top;
    for (let i = 0; i < top; i++) {
      text.unshift(emptyLine);
    }
    for (let i = 0; i < bottom; i++) {
      text.push(emptyLine);
    }
  } else if (vAlign === 'bottom') {
    for (let i = text.length; i < height; i++) {
      text.unshift(emptyLine);
    }
  }

  return text;
}
