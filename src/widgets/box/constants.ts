import { Styles } from '..';
import { Colors } from '../constants';
import { BoxBorders, BoxStyles } from '.';

export const boxStyles: Styles<BoxStyles> = {
  borders: {
    fg: Colors.fg,
    bg: Colors.bg,
    focused: {
      fg: Colors.focused,
    },
    disabled: {
      fg: Colors.disabled,
    },
  },
};

export const singleLineBorders: BoxBorders = {
  center: '',
  topLeft: '┌',
  top: '─',
  topRight: '┐',
  left: '│',
  right: '│',
  bottomLeft: '└',
  bottom: '─',
  bottomRight: '┘',
};

export const doubleLineBorders: BoxBorders = {
  center: '',
  topLeft: '╔',
  top: '═',
  topRight: '╗',
  left: '║',
  right: '║',
  bottomLeft: '╚',
  bottom: '═',
  bottomRight: '╝',
};
