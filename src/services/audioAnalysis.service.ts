import Axios, { AxiosAdapter } from 'axios';
import { Auth } from '../auth/auth';
import * as config from '../../config';
import { Storage } from '../utils';

class AudioAnalysisService {
  private auth: Auth;
  private axios: AxiosAdapter;
  private storage: Storage;
  private trackId: string | null;
  private uidTokenKey: string;
  private uidTrackIdKey: string;
  private uidTrackPitchKey: string;
  private url: string;

  constructor() {
    this.auth = new Auth();
    this.axios = Axios;
    this.storage = new Storage();
    this.trackId = null;
    this.uidTokenKey = config.UID_TOKEN_KEY;
    this.uidTrackIdKey = config.UID_TRACK_ID_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;
    this.url = config.SPOTIFY_BASE_PATH;
  }

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

  private parseData({ data: { segments } }: any) {
    const parsedSegments = segments.reduce((acc: any, val: any): {} => {
      const { timbre, loudness_max } = val;
      const parsedData = val.pitches.reduce((res: any[], pitch: number, idx: number) => {
        res.push(this.getPeakValue(
          Math.abs((timbre[idx]) * loudness_max) * (pitch * pitch)
        ));
        return res;
      }, []);

      acc.push({ s: val.start, d: parsedData });

      return acc;
    }, []);

    this.storage.set(this.uidTrackPitchKey, parsedSegments);
  }

  private getPeakValue(val:number) {
    switch (true) {
      case val > 300: return 10;
      case val > 225: return 9;
      case val > 160: return 8;
      case val > 135: return 7;
      case val > 100: return 6;
      case val > 75: return 5;
      case val > 50: return 4;
      case val > 25: return 3;
      case val > 10: return 2;
      case val > 1: return 1;
      default: return 0;
    }
  }
}

export { AudioAnalysisService };
