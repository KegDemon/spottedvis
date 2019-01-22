import Axios, { AxiosAdapter } from 'axios';
import * as config from '../../config';
import { Pitch } from '../interfaces';
import { Storage } from '../utils';

/**
 *
 *
 * @class AudioAnalysisService
 */
class AudioAnalysisService {
  private axios: AxiosAdapter;
  private storage: Storage;
  private trackId: string | null;
  private uidTokenKey: string;
  private uidTrackIdKey: string;
  private uidTrackPitchKey: string;
  private url: string;

  constructor() {
    this.axios = Axios;
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
  public get(): void {
    this.trackId = this.storage.get(this.uidTrackIdKey) as string | null;

    if (!this.trackId) {
      return void 0;
    }

    this.axios({
      url: `${this.url}/audio-analysis/${this.trackId}`,
      headers: {
        'Authorization': `Bearer ${this.storage.get(this.uidTokenKey)}`
      }
    }).then(data => {
      this.parseData(data);
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
  private parseData({ data: { segments } }: any): void {
    const parsedSegments = segments.reduce((acc: any, val: any): {} => {
      const { timbre, loudness_max } = val;
      const parsedData: Pitch[] = val.pitches.reduce((res: any[], pitch: number, idx: number): Pitch[] => {
        res.push(this.getPeakValue(
          Math.abs((timbre[idx]) * loudness_max) * (pitch * pitch)
        ));
        return res;
      }, []);

      acc.push({
        s: val.start,
        t: +(val.duration * 1000).toFixed(3),
        d: parsedData,
      });

      return acc;
    }, []);

    this.storage.set(this.uidTrackPitchKey, parsedSegments);
  }

  /**
   * Applies an inverse curve from the normzalied
   * data so we can have a better visualization
   * when passed to the visualizer.
   *
   * Example curve generation:
   * const a = [0.025];
   * const b = 5.75;
   * for (let i = 0; i < 9; ++i) {
   *   a.push(+(a[i] + (a[i ? i - 1 : 0] * b)).toFixed(3))
   * }
   *
   * Output: [0.025, 0.169, 0.313, 1.285, 3.085, 10.474, 28.213, 88.439, 250.664, 759.188]
   *
   * @private
   * @param {number} val
   * @returns {number}
   * @memberof AudioAnalysisService
   */
  private getPeakValue(val: number): number {
    switch (true) {
      case val < 0.025: return 10;
      case val < 0.169: return 9;
      case val < 0.313: return 8;
      case val < 1.285: return 7;
      case val < 3.085: return 6;
      case val < 10.474: return 5;
      case val < 28.213: return 4;
      case val < 88.439: return 3;
      case val < 250.664: return 2;
      case val < 759.188: return 1;
      case val >= 759.188: return 0;
      default: return 0;
    }
  }
}

export { AudioAnalysisService };
