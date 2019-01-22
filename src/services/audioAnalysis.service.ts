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

      acc.push({
        s: val.start,
        t: Math.round(val.duration * 1000),
        d: parsedData,
      });

      return acc;
    }, []);

    this.storage.set(this.uidTrackPitchKey, parsedSegments);
  }

  private getPeakValue(val:number) {
    switch (true) {
      case val > 375.654: return 10;
      case val > 178.188: return 9;
      case val > 85.114: return 8;
      case val > 40.118: return 7;
      case val > 19.395: return 6;
      case val > 8.932: return 5;
      case val > 4.51: return 4;
      case val > 1.906: return 3;
      case val > 1.122: return 2;
      case val > 0.338: return 1;
      default: return 0;
    }
  }
}

export { AudioAnalysisService };
