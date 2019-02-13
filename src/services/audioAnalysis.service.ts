import * as config from '../../config';
import { Pitch, PreCalcPitch } from '../interfaces';
import { Storage } from '../utils';

/**
 *
 *
 * @class AudioAnalysisService
 */
class AudioAnalysisService {
  private curveValues: number[];
  private maxValue: number;
  private storage: Storage;
  private trackId: string | null;
  private uidTokenKey: string;
  private uidTrackIdKey: string;
  private uidTrackPitchKey: string;
  private url: string;

  constructor() {
    this.curveValues = [];
    this.maxValue = 0;
    this.storage = new Storage();
    this.trackId = null;
    this.uidTokenKey = config.UID_TOKEN_KEY;
    this.uidTrackIdKey = config.UID_TRACK_ID_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;
    this.url = config.SPOTIFY_BASE_PATH;
  }

  /**
   * Fetches the current track's audio analysis
   * features from the Spotify API.
   *
   * @returns {void}
   * @memberof AudioAnalysisService
   */
  public get(): Promise<void> {
    this.trackId = this.storage.get(this.uidTrackIdKey) as string | null;
    this.storage.remove(this.uidTrackPitchKey);

    return fetch(`${this.url}/audio-analysis/${this.trackId}`, {
      headers: {
        Authorization: `Bearer ${this.storage.get(this.uidTokenKey)}`
      }
    })
      .then((data: Response) => data.json())
      .then((data: any) => {
        this.parseData(data);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }

  /**
   * Handles transforming the returned data
   * from the Spotify API into a normalized
   * data set that resembles a frequency chart.
   *
   * @private
   * @param {*} { data: { segments } }
   * @memberof AudioAnalysisService
   */
  private parseData({ segments }: any): void {
    this.maxValue = this.getMax(segments);
    this.curveValues = this.createCurveValues();

    let parsedData: Pitch[] = (segments as []).map((val: any) => {
      let ret: number[] = (val.pitches as number[])
        .reduce((prev: PreCalcPitch[], curr: number, i: number) => {
          prev.push({
            p: curr,
            t: this.getPeakValue(Math.abs(val.timbre[i]))
          });
          return prev;
        }, [])
        .sort((a: PreCalcPitch, b: PreCalcPitch) => a.p - b.p)
        .map((val: PreCalcPitch) => val.t);

      return {
        d: ret,
        s: val.start,
        t: +(val.duration * 1000).toFixed(3)
      };
    });

    this.storage.set(this.uidTrackPitchKey, parsedData);

    parsedData.length = 0;
    this.curveValues.length = 0;
  }

  /**
   * Applies an inverse curve from the normzalied
   * data so we can have a better visualization
   * when passed to the visualizer.
   *
   * @private
   * @param {number} val
   * @returns {number}
   * @memberof AudioAnalysisService
   */
  private getPeakValue(val: number): number {
    for (let i = 10; i > 0; --i) {
      if (val > this.curveValues[i - 1]) {
        return i;
      }
    }

    return 0;
  }

  /**
   * Gets the largest absolute
   * timbre value from the
   * collection of segments.
   *
   * @private
   * @param segments
   * @returns {number}
   */
  private getMax(segments: any): number {
    let ret = 0;

    for (let i = 0, ii = segments.length; i < ii; ++i) {
      const max = Math.max(
        ...segments[i].timbre.map((t: number) => Math.abs(t))
      );

      ret = ret < max ? max : ret;
    }

    return ret;
  }

  /**
   * Generates 10 points on
   * an exponential curve,
   * so we can map our timbre
   * values against it.
   *
   * @private
   * @returns {number}
   */
  private createCurveValues(): number[] {
    const rangeCollection = [];
    const d = 1.025 * Math.pow(this.maxValue, 0.1);
    for (let i = 0, ii = 10; i < ii; ++i) {
      rangeCollection.push(Math.pow(d, i));
    }

    return rangeCollection;
  }
}

export { AudioAnalysisService };
