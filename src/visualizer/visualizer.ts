import * as config from '../../config';
import { Storage } from '../utils';

interface Pitch {
  s: number;
  t: number;
  d: number[];
}

class Visualizer {
  private isRunning: boolean;
  private storage: Storage;
  private uidProgressKey: string;
  private uidTrackPitchKey: string;

  private nodeCollection: HTMLCollection;

  private interval: any;

  constructor() {
    this.isRunning = false;
    this.storage = new Storage();
    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;

    this.nodeCollection = document.getElementsByClassName('node');
  }

  private tickSync = (tick: number, sync: number): number => sync > (tick + 5) || tick > (sync + 5) ? sync : tick;

  private getSyncIndex(inputArray: any[]): number {
    const prog = this.storage.get(this.uidProgressKey) as number;
    return inputArray.reduce((prev: number, curr: any, idx: number, ref: any) =>
      Math.abs(curr.s - prog) < Math.abs(ref[prev].s - prog) ? idx : prev, 0)
  }

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

  private playerAnimate(tick: number, pitches: Pitch[]): void {
    tick = this.tickSync(tick, this.getSyncIndex(pitches));

    const currentPitchRange: number[] = pitches[tick] ? pitches[tick].d : [];
    const nextTick = tick + 1;

    for (let i = 0, ii = this.nodeCollection.length; i < ii; ++i) {
      for ( let z = 0, zz = this.nodeCollection[i].children.length; z < zz; ++z) {
        this.nodeCollection[i].children[z].classList[ z >= currentPitchRange[i] ? 'add' : 'remove']('hidden');
      }
    }

    if (!pitches[nextTick]) {
      return;
    }

    this.interval = setTimeout(() => {
      this.playerAnimate(nextTick, pitches);
    }, pitches[nextTick].t);
  }

  public stop(): void {
    clearTimeout(this.interval);
    this.isRunning = false;

    for (let i = 0, ii = this.nodeCollection.length; i < ii; ++i) {
      for ( let z = 0, zz = this.nodeCollection[i].children.length; z < zz; ++z) {
        this.nodeCollection[i].children[z].classList.add('hidden');
      }
    }
  }

  public isActive = (): boolean => this.isRunning;
}

export { Visualizer };
