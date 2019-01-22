import * as config from '../../config';
import { Pitch } from '../interfaces';
import { Storage } from '../utils';

/**
 *
 *
 * @class Visualizer
 */
class Visualizer {
  private isRunning: boolean;
  private nodeCollection: HTMLCollection;
  private storage: Storage;
  private timeout: any;
  private uidProgressKey: string;
  private uidTrackPitchKey: string;

  constructor() {
    this.isRunning = false;
    this.nodeCollection = document.getElementsByClassName('node');
    this.storage = new Storage();
    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;
  }

  /**
   * If tick is above or behind on average,
   * resync based on the current track position.
   *
   * @private
   * @memberof Visualizer
   */
  private tickSync = (tick: number, sync: number): number => sync > (tick + 5) || tick > (sync + 5) ? sync : tick;

  private getSyncIndex(inputArray: any[]): number {
    const prog = this.storage.get(this.uidProgressKey) as number;
    return inputArray.reduce((prev: number, curr: any, idx: number, ref: any) =>
      Math.abs(curr.s - prog) < Math.abs(ref[prev].s - prog) ? idx : prev, 0)
  }

  /**
   * Kick off the visualizer when there
   * is the correct data present to start
   * it. Otherwise, check again after delay.
   *
   * @returns {void}
   * @memberof Visualizer
   */
  public start(): void {
    this.stop();
    this.isRunning = true;

    const pitches = this.storage.get(this.uidTrackPitchKey) as Pitch[] || [];

    if (!pitches.length) {
      this.stop();
      this.isRunning = false;

      setTimeout(() => {
        this.start();
      }, 1000);

      return;
    }

    this.playerAnimate(this.getSyncIndex(pitches), pitches);
  }

  /**
   * Takes the nodes and applies or removes
   * a 'hidden' class based on the current
   * pitch metric based on tick.
   *
   * @private
   * @param {number} tick
   * @param {Pitch[]} pitches
   * @returns {void}
   * @memberof Visualizer
   */
  private playerAnimate(tick: number, pitches: Pitch[]): void {
    tick = this.tickSync(tick, this.getSyncIndex(pitches));

    const currentPitchRange: number[] = pitches[tick] ? pitches[tick].d : [];
    const nextTick = tick + 1;

    for (let i = 0, ii = this.nodeCollection.length; i < ii; ++i) {
      for (let z = 0, zz = this.nodeCollection[i].children.length; z < zz; ++z) {
        this.nodeCollection[i].children[z].classList[z >= currentPitchRange[i] ? 'add' : 'remove']('hidden');
      }
    }

    if (!pitches[nextTick]) {
      return;
    }

    this.timeout = setTimeout(() => {
      this.playerAnimate(nextTick, pitches);
    }, pitches[nextTick].t);
  }

  /**
   * Clears the timer on the visualizer
   * and sets all bars members to hidden.
   *
   * @memberof Visualizer
   */
  public stop(): void {
    clearTimeout(this.timeout);
    this.isRunning = false;

    for (let i = 0, ii = this.nodeCollection.length; i < ii; ++i) {
      for (let z = 0, zz = this.nodeCollection[i].children.length; z < zz; ++z) {
        this.nodeCollection[i].children[z].classList.add('hidden');
      }
    }
  }

  /**
   * Is the visualizer active.
   *
   * @returns {boolean}
   * @memberof Visualizer
   */
  public isActive = (): boolean => this.isRunning;
}

export { Visualizer };
