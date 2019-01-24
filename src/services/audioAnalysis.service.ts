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
    let acc: number[] = [];
    let _s: number[] = [];

    for (let i = 0, ii = segments.length; i < ii; ++i) {
      acc = [];
      _s = segments[i].pitches.slice().sort();

      for (let z = 0, zz = segments[i].pitches.length; z < zz; ++z) {
        let idx = _s.indexOf(segments[i].pitches[z]);

        acc[acc[idx] ? acc[idx + 1] ? idx + 2 : idx + 1 : idx] = this.getPeakValue(
          (segments[i].timbre[z] * segments[i].loudness_max) * segments[i].pitches[z]
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
      case val > 714.496 || val < -714.496: return 10;
      case val > 330.036 || val < -330.036: return 9;
      case val > 153.784 || val < -153.784: return 8;
      case val > 70.501 || val < -70.501: return 7;
      case val > 33.313 || val < -33.313: return 6;
      case val > 14.875 || val < -14.875: return 5;
      case val > 7.375 || val < -7.375: return 4;
      case val > 3 || val < -3: return 3;
      case val > 1.75 || val < -1.75: return 2;
      case val > 0.5 || val < -0.5: return 1;
      default: return 0;
    }
  }
}

export { AudioAnalysisService };
