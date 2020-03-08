import { Styles } from '.';

export const ELLIPSIS = '…';

export const enum Colors {
  fg = '#bbb',
  bg = '#000',
  focused = '#fff',
  disabled = '#777',
  ligthDim = '#999',
  darkDim = '#333',
}

export const widgetStyles: Styles = {
  fg: Colors.fg,
  bg: Colors.bg,
  disabled: {
    fg: Colors.disabled,
  },
  focused: {
    fg: Colors.focused,
  },
};
