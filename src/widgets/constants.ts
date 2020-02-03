import { Styles } from '.';

export const enum Colors {
  fg = '#bbb',
  bg = '#000',
  focused = '#fff',
  disabled = '#777',
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
