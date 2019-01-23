import * as config from '../../config';
import { Storage } from '../utils';
import { Pitch } from '../interfaces/index';

/**
 *
 *
 * @class AudioAnalysisService
 */
class AudioAnalysisService {
  private storage: Storage;
  private trackId: string | null;
  private uidTokenKey: string;
  private uidTrackIdKey: string;
  private uidTrackPitchKey: string;
  private url: string;

  constructor() {
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

    fetch(`${this.url}/audio-analysis/${this.trackId}`, {
      headers: {
        'Authorization': `Bearer ${this.storage.get(this.uidTokenKey)}`
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
    let parsedData: Pitch[] = [];
    let acc: any[] = [];

    for (let i = 0, ii = segments.length; i < ii; ++i) {
      acc = [];
      for (let z = 0, zz = segments[i].pitches.length; z < zz; ++z) {
        acc[z] = this.getPeakValue(
          Math.abs(segments[i].timbre[z] * segments[i].loudness_max) * segments[i].pitches[z]
        );
      }

      parsedData[i] = ({
        d: acc,
        s: segments[i].start,
        t: +(segments[i].duration * 1000).toFixed(3),
      });
    }

    this.storage.set(this.uidTrackPitchKey, parsedData);

    parsedData.length = 0;
    acc.length = 0;
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
      case val < 0.175: return 9;
      case val < 0.325: return 8;
      case val < 1.375: return 7;
      case val < 3.325: return 6;
      case val < 11.575: return 5;
      case val < 31.525: return 4;
      case val < 100.975: return 3;
      case val < 290.125: return 2;
      case val < 895.975: return 1;
      case val >= 895.975: return 0;
      default: return 0;
    }
  }
}

export { AudioAnalysisService };
