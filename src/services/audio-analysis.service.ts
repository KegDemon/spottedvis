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
      const pitchMap: number[] = val.pitches.map((pitch: Number) => Math.round(+pitch * 10));

      const { timbre: timb } = val;
      const parsedData = pitchMap.reduce((res: any, pitch: any, idx: number) => {
        const timbreLoc = this.pitchBuckets(timb[idx]);

        if (!res[idx]) {
          res[idx] = 0;
        }

        if (pitch > res[timbreLoc] || pitch > res[idx]) {
          res[timbreLoc] = pitch;
        }

        return res;
      }, [] as any);

      acc.push({ s: val.start, d: parsedData });

      return acc;
    }, []);

    this.storage.set(this.uidTrackPitchKey, parsedSegments);
  }

  private pitchBuckets(timbre: number): number {
    switch (true) {
      case (timbre < -75): return 0;
      case (timbre < -60): return 1;
      case (timbre < -45): return 2;
      case (timbre < -30): return 3;
      case (timbre < -15): return 4;
      case (timbre < 0): return 5;
      case (timbre > 75): return 11;
      case (timbre > 60): return 10;
      case (timbre > 45): return 9;
      case (timbre > 30): return 8;
      case (timbre > 15): return 7;
      case (timbre >= 0): return 6;
      default: return 0;
    }
  }
}

export { AudioAnalysisService };
