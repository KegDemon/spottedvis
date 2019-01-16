import * as d3 from 'd3';
import * as config from '../../config';
import { Storage } from '../utils';

class Visualizer {
  private d3: typeof d3;
  private isRunning: boolean;
  private storage: Storage;
  private uidProgressKey: string;
  private uidTrackDurationKey: string;
  private uidTrackPitchKey: string;

  private interval: any;

  constructor() {
    this.d3 = d3;
    this.isRunning = false;
    this.storage = new Storage();
    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidTrackDurationKey = config.UID_TRACK_DURATION_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;
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

        if (tick < tickTest) {
          tick = tickTest;
        }
      }

      let a: any = [];

      if (t[tick]) {
        a = t[tick];
        a = a.d;
      }

      this.d3.select('.vis')
        .html('')
        .selectAll('div')
        .data(a)
        .enter()
          .append('div')
          .selectAll('div')
          .data(data => Array(data))
          .enter()
          .append('div');

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
