import * as config from '../../config';
import { Storage } from '../utils';

interface Pitches {
  s: number;
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

  private getSyncIndex(inputArray: any[], prog: any): number {
    return inputArray.reduce((prev: number, curr: any, idx: number, ref: any) =>
      Math.abs(curr.s - prog) < Math.abs(ref[prev].s - prog) ? idx : prev, 0)
  }

  public start(): void {
    this.stop();
    this.isRunning = true;

    const pitches = this.storage.get(this.uidTrackPitchKey) as Pitches[] || [];

    if (!pitches.length) {
      this.stop();
      this.isRunning = false;
      setTimeout(() => {
        this.start();
      }, 1000);
      return void 0;
    }

    const prog: any = this.storage.get(this.uidProgressKey);
    let tick: number = this.getSyncIndex(pitches, prog);

    const playerSync = () => {
      const currentPitchRange: number[] = pitches[tick] ? pitches[tick].d : [];

      for (let i = 0, ii = this.nodeCollection.length; i < ii; ++i) {
        for ( let z = 0, zz = this.nodeCollection[i].children.length; z < zz; ++z) {
          this.nodeCollection[i].children[z].classList[ z >= currentPitchRange[i] ? 'add' : 'remove']('hidden');
        }
      }

      this.interval = setTimeout((self: any) => {
        if (pitches[tick + 1]) {
          playerSync();
          return void 0;
        }

        clearTimeout(self.interval);
      }, ((pitches[tick + 1].s - pitches[tick].s) * 1000), this);

      tick += 1;
    }

    playerSync();
  }

  public stop(): void {
    clearTimeout(this.interval);
    this.isRunning = false;
  }

  public isActive = () => this.isRunning;
}

export { Visualizer };
