import { Widget, WidgetOptions } from '..';
import { progressBarStyles } from './constants';
import { clamp } from '@src/util/clamp';
import { Tile } from '@src';

export type ProgressBarStyles = 'active' | 'done' | 'pending';

export type ProgressBarType = 'horizontal' | 'vertical';

export interface ProgressBarOptions extends WidgetOptions<ProgressBarStyles> {
  /** Initial progress ([0-1]) (`0` by default) */
  progress?: number;
  /** Type/orientation of the ProgressBar (`horizontal` by default) */
  type?: ProgressBarType;
  /** If true, the active element will be drawn even if the progress is 0 (`false` by default) */
  drawActiveOnEmpty?: boolean;
  /** If true, the active element will be drawn even if the progress is 1 (`false` by default) */
  drawActiveOnFull?: boolean;
}

/**
 * Progress Bar
 */
export class ProgressBar extends Widget<ProgressBarStyles> {
  protected progress: number;
  protected readonly type: ProgressBarType;
  protected readonly drawActiveOnEmpty: boolean;
  protected readonly drawActiveOnFull: boolean;
  private readonly setTile: (i: number, tile: Tile) => void;
  private firstEnd: boolean = false;

  constructor(options: ProgressBarOptions) {
    super(options, progressBarStyles);

    this.setContent = this.setContent.bind(this);
    this.progress = options.progress || 0;
    this.type = options.type || 'horizontal';
    this.drawActiveOnEmpty = options.drawActiveOnEmpty || false;
    this.drawActiveOnFull = options.drawActiveOnFull || false;

    if (this.type === 'horizontal') {
      this.setTile = this.setTileHorizontal;
      this.resize(this.width, 1);
    } else {
      this.setTile = this.setTileVertical;
      this.resize(1, this.height);
    }

    this.on('resize', this.setContent);
  }

  public setProgress(progress: number): void {
    const current = this.progress;
    this.progress = clamp(0, progress, 1);

    if (this.progress === current) return;

    this.setContent();

    this.emit('update');
    if (this.progress === 1) {
      if (this.firstEnd) {
        this.emit('first-time-end');
        this.firstEnd = false;
      }
      this.emit('end');
    }
  }

  public addProgress(delta: number): void {
    this.setProgress(this.progress + delta);
  }

  public getProgress(): number {
    return this.progress;
  }

  protected setContent(): void {
    const { progress } = this;
    const full = this.type === 'horizontal' ? this.width : this.height;
    const done = Math.floor(progress * full);

    let tile = this.getStyle('done');
    for (let i = 0; i < done; i++) {
      this.setTile(i, tile);
    }

    tile = this.getStyle('pending');
    for (let i = done; i < full; i++) {
      this.setTile(i, tile);
    }

    if (
      (progress !== 0 || this.drawActiveOnEmpty) &&
      (progress !== 1 || this.drawActiveOnFull)
    ) {
      this.setTile(Math.max(0, done - 1), this.getStyle('active'));
    }
  }

  private setTileHorizontal(i: number, tile: Tile): void {
    this.content[0][i] = tile;
  }

  private setTileVertical(i: number, tile: Tile): void {
    this.content[i][0] = tile;
  }
}
