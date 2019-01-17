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

  public start(): void {
    this.stop();
    this.isRunning = true;

    const t = this.storage.get(this.uidTrackPitchKey) as [] || [];

    const runTime = +this.storage.get(this.uidTrackDurationKey);
    const intervalTimer = runTime / (this.storage.get(this.uidTrackPitchKey) as [] || []).length;

    let tick: number = 0;
    let lastProg: number = 0;
    this.interval = setInterval(() => {
      const prog: any = this.storage.get(this.uidProgressKey);

      if (lastProg !== prog) {
        lastProg = prog;
        const tickTest = t.reduce((prev: number, curr: any, idx: number, ref: any) =>
          Math.abs(curr.s - prog) < Math.abs(ref[prev].s - prog) ? idx : prev, 0);

        if (tick > tickTest) {
          tick = tickTest;
        }
      }

      let a: any = [];

      if (t[tick]) {
        a = t[tick];
        a = a.d;
      }

      for (let i = 0, ii = this.nodeCollection.length; i < ii; ++i) {
        for ( let z = 0, zz = this.nodeCollection[i].children.length; z < zz; ++z) {
          this.nodeCollection[i].children[z].classList[ z >= a[i] ? 'add' : 'remove']('hidden');
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
