import { Styles } from '..';
import { Colors } from '../constants';
import { ProgressBarStyles } from '.';

export const progressBarStyles: Styles<ProgressBarStyles> = {
  active: {
    char: ' ',
    bg: Colors.ligthDim,
  },
  done: {
    char: ' ',
    bg: Colors.ligthDim,
  },
  pending: {
    char: ' ',
    bg: Colors.darkDim,
  },
};

export const emptyProgressBarStyles: Styles<ProgressBarStyles> = {
  active: {
    char: ' ',
    bg: Colors.ligthDim,
  },
  done: {
    char: ' ',
    bg: Colors.darkDim,
  },
  pending: {
    char: ' ',
    bg: Colors.darkDim,
  },
};
