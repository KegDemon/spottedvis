import * as config from '../../config';
import { Storage } from '../utils';

class Visualizer {
  private isRunning: boolean;
  private storage: Storage;
  private uidProgressKey: string;
  private uidTrackDurationKey: string;
  private uidTrackPitchKey: string;

  private nodeCollection: HTMLCollection;

  private interval: any;

  constructor() {
    this.isRunning = false;
    this.storage = new Storage();
    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidTrackDurationKey = config.UID_TRACK_DURATION_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;

    this.nodeCollection = document.getElementsByClassName('node');
  }

  private getSyncIndex(inputArray: [], prog: any): number {
    return inputArray.reduce((prev: number, curr: any, idx: number, ref: any) =>
      Math.abs(curr.s - prog) < Math.abs(ref[prev].s - prog) ? idx : prev, 0)
  }

  public start(): void {
    this.stop();
    this.isRunning = true;

    const pitches = this.storage.get(this.uidTrackPitchKey) as [] || [];

    if (!pitches.length) {
      this.stop();
      setTimeout(() => {
        this.start();
      }, 1000);
      return void 0;
    }

    const runTime = +this.storage.get(this.uidTrackDurationKey);
    const intervalTimer = runTime / (this.storage.get(this.uidTrackPitchKey) as [] || []).length;

    let prog: any = this.storage.get(this.uidProgressKey);
    let tick: number = this.getSyncIndex(pitches, prog);
    let lastProg: number = 0;
    let lastSyncIdx: number = 0;

    this.interval = setInterval(() => {
      prog = this.storage.get(this.uidProgressKey);

      if (lastProg !== prog) {
        lastProg = prog;
        lastSyncIdx = this.getSyncIndex(pitches, prog);
        tick = tick > lastSyncIdx ? lastSyncIdx : tick;
      }

      let currentPitchRange: [] = pitches[tick] ? (pitches[tick] as {s: number, d: []}).d : [];

      for (let i = 0, ii = this.nodeCollection.length; i < ii; ++i) {
        for ( let z = 0, zz = this.nodeCollection[i].children.length; z < zz; ++z) {
          this.nodeCollection[i].children[z].classList[ z >= currentPitchRange[i] ? 'add' : 'remove']('hidden');
        }
      }

      tick += 1;
    }, intervalTimer);
  }

  public stop(): void {
    clearInterval(this.interval);
    this.isRunning = false;
  }

  public isActive = () => this.isRunning;

}

export { Visualizer };
