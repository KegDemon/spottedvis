import anime from 'animejs';
import EventEmitter from 'eventemitter3';
import * as config from '../../config';
import { Pitch } from '../interfaces';
import { Storage } from '../utils';

/**
 *
 *
 * @class Visualizer
 */
class Visualizer {
  private eventemitter: EventEmitter;
  private isRunning: boolean;
  private nodeCollection: HTMLElement[];
  private storage: Storage;
  private timeout: any;
  private timeoutStart: any;
  private uidProgressKey: string;
  private uidTrackPitchKey: string;

  constructor() {
    this.eventemitter = new EventEmitter();
    this.isRunning = false;
    this.nodeCollection = [];
    this.storage = new Storage();
    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;
    this.registerEventEmitters();
    this.parseNodes();
  }

  /**
   * Registers the local EventEmitters
   * for consumption.
   *
   * @private
   * @memberof Visualizer
   */
  private registerEventEmitters(): void {
    this.eventemitter.on('event:animation-start', this.start, this);
    this.eventemitter.on(
      'event:animation-update',
      (tick: number, pitches: Pitch[]) => {
        if (!this.isRunning) {
          this.stop();
          return;
        }

        clearTimeout(this.timeout);
        this.timeout = setTimeout(
          this.playerAnimate.bind(this),
          0,
          tick,
          pitches
        );
      }
    );
  }

  /**
   * Create a static array reference
   * of the DOM nodes to run against.
   *
   * @private
   * @memberof Visualizer
   */
  private parseNodes(): void {
    const collection: HTMLCollection = document.getElementsByClassName('node');
    const arr: HTMLElement[] = [];

    for (let i = 0, ii = collection.length; i < ii; ++i) {
      arr.push(collection[i] as HTMLElement);
    }

    this.nodeCollection = arr;
  }

  /**
   * If tick is above or behind on average,
   * resync based on the current track position.
   *
   * @private
   * @memberof Visualizer
   */
  private tickSync = (tick: number, sync: number): number =>
    sync > tick + 5 || tick > sync + 5 ? sync : tick;

  private getSyncIndex(inputArray: any[]): number {
    const prog = this.storage.get(this.uidProgressKey) as number;
    return inputArray.reduce(
      (prev: number, curr: any, idx: number, ref: any) =>
        Math.abs(curr.s - prog) < Math.abs(ref[prev].s - prog) ? idx : prev,
      0
    );
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

    const pitches = (this.storage.get(this.uidTrackPitchKey) as Pitch[]) || [];

    if (!pitches.length) {
      this.stop();
      this.isRunning = false;

      this.timeoutStart = setTimeout(() => {
        this.eventemitter.emit('event:animation-start');
      }, 1000);

      return;
    }

    this.eventemitter.emit(
      'event:animation-update',
      this.getSyncIndex(pitches),
      pitches
    );
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
    const syncTick = this.tickSync(tick, this.getSyncIndex(pitches));
    const currentPitchRange: number[] = pitches[syncTick]
      ? pitches[syncTick].d
      : [];
    const nextTick = syncTick + 1;

    anime({
      complete: () => {
        this.eventemitter.emit('event:animation-update', nextTick, pitches);
      },
      delay: 0,
      duration: pitches[syncTick].t,
      easing: `cubicBezier(0.65, 0, 0.03, 1)`,
      height: (el: HTMLElement, i: number) => currentPitchRange[i] * 50 || 25,
      loop: 0,
      targets: this.nodeCollection
    });

    if (!pitches[nextTick]) {
      this.stop();
    }
  }

  /**
   * Clears the timer on the visualizer
   * and sets all bars members to hidden.
   *
   * @memberof Visualizer
   */
  public stop(): void {
    clearTimeout(this.timeout);
    clearTimeout(this.timeoutStart);
    this.timeout = void 0;
    this.timeoutStart = void 0;
    this.isRunning = false;

    anime({
      delay: 0,
      duration: 300,
      easing: `cubicBezier(0.65, 0, 0.03, 1)`,
      height: 25,
      loop: 0,
      targets: this.nodeCollection
    });
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
