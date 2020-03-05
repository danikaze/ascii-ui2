import { Styles } from '..';
import { Colors } from '../constants';
import { TextStyles } from '.';

export const textStyles: Styles<TextStyles> = {
  fg: Colors.fg,
  bg: Colors.bg,
  focused: {
    fg: Colors.focused,
  },
  disabled: {
    fg: Colors.disabled,
  },
  filler: {
    char: ' ',
    bg: Colors.bg,
  },
};
