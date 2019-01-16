import * as d3 from 'd3';
import * as config from '../../config';
import { Storage } from '../utils';

class Visualizer {
  private d3: typeof d3;
  private storage: Storage;
  private trackId: string | null;
  private uidProgressKey: string;
  private uidTokenKey: string;
  private uidTrackIdKey: string;
  private uidTrackPitchKey: string;
  private visEl: any;

  private interval: any;

  constructor() {
    this.d3 = d3;
    this.storage = new Storage();
    this.trackId = null;
    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidTokenKey = config.UID_TOKEN_KEY;
    this.uidTrackIdKey = config.UID_TRACK_ID_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;
    this.visEl = this.d3.select('.vis');
  }

  public start(): void {
    this.stop();
    const t = this.storage.get(this.uidTrackPitchKey) as [] || [];

    this.interval = setInterval(() => {
      const prog: any = this.storage.get(this.uidProgressKey);
      const foundIdx = t
        // .slice(prevIdx, t.length)
        .reduce((prev: any, curr: any) => {
          return Math.abs(curr.s - prog) < Math.abs(prev.s - prog) ? curr : prev;
        }, {s: 0, d: []} as any);

      this.d3.select('.vis')
        .html('')
        .selectAll('div')
        .data(foundIdx.d)
        .enter()
          .append('div')
          .selectAll('div')
          .data(data => Array(data))
          .enter()
          .append('div');
    }, 500);
  }

  public stop(): void {
    clearInterval(this.interval);
  }

}

export { Visualizer };
