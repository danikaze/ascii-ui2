import { Tile, tileProperties, TileProperties } from '@src';
import { Node } from '@src/node';
import { Element, ElementOptions } from '@src/element';
import { extendObjectsOnly } from 'extend-objects-only';
import { widgetStyles } from './constants';

export type BasicStyles = 'focused' | 'disabled';

type DefaultStyle = Tile & { focused?: Tile; disabled?: Tile };

/**
 * Styles are defined in the following way:
 * ```
 * {
 *   ...Tile,
 *   focused: Tile,
 *   disabled: Tile,
 *
 *   type1: {
 *     ...Tile,
 *     focused: Tile,
 *     disabled: Tile,
 *   },
 *
 *   type2...
 * }
 * ```
 *
 * where the root `...Tile` defines the global style.
 * the root `focused` and `disabled` will inherit the global style and
 * define the styles for those widget states.
 *
 * Other styles can be created. Each style will inherit the global one, and
 * each state's `focused` and `disabled` will inherit the base state too.
 */
export type Styles<S extends string = BasicStyles> = Partial<
  Tile & Record<S | BasicStyles, DefaultStyle>
>;

export interface WidgetOptions<
  S extends string = BasicStyles,
  C extends Widget<S> = Widget<S>,
  P extends Widget<S> = Widget<S>
> extends ElementOptions<C, P> {
  styles?: Styles<S>;
}

export abstract class Widget<
  S extends string = BasicStyles,
  C extends BasicWidget<S> = BasicWidget<S>,
  P extends BasicWidget<S> = BasicWidget<S>
> extends Element<C, P> {
  public static theme: Styles;
  /** Precalculated styles to use with `getStyle` */
  private readonly styles: Styles<S>;

  constructor(options: WidgetOptions<S, C, P>, baseStyles?: Styles<S>) {
    super(options);
    this.styles = Widget.createStyles(baseStyles, options.styles);
    this.on('focus,blur,enable,disable', ({ target }) => {
      if (target === (this as Node)) {
        this.setContent();
      }
    });
  }

  /**
   * Precalculate the nested styles so it doesn't need to be done every time they are accessed
   */
  private static createStyles<S extends string | BasicStyles>(
    base?: Styles<S>,
    options?: Styles<S>
  ): Styles<S> {
    const res = extendObjectsOnly({}, widgetStyles, base!, options!) as Styles<
      S
    >;
    Object.keys(res).forEach(key => {
      if (tileProperties.indexOf(key) !== -1) return;
      Widget.extendStyles(res[key as S]!, res);
    });

    return res;
  }

  /**
   * Extend a Style object's Tile properties only, recursively
   */
  private static extendStyles(target: DefaultStyle, base: DefaultStyle): void {
    for (const property of tileProperties as TileProperties[]) {
      if (!target[property]) {
        // tslint:disable: no-any
        (target as any)[property] = base[property];
      }
    }

    if (target.focused) this.extendStyles(target.focused, target);
    if (target.disabled) this.extendStyles(target.disabled, target);
  }

  /**
   * Get the style corresponding to the current status, for the specified type
   * If no type is specified, it will return the global one
   */
  protected getStyle(type?: S): Tile {
    let styles = (type
      ? this.styles[type] || this.styles
      : this.styles) as DefaultStyle;
    if (this.focused) {
      if (styles.focused) {
        styles = styles.focused;
      }
    } else if (this.disabled && styles.disabled) {
      styles = styles.disabled;
    }

    return styles;
  }
}

interface BasicWidget<S extends string>
  extends Widget<S, BasicWidget<S>, BasicWidget<S>> {}
