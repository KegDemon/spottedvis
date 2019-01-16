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

  private parseData({data: {segments}}: any) {
    const parsedSegments = segments.reduce((acc: any, val: any): {} => {
      acc.push({s: val.start, d: val.pitches.map((val: Number) => Math.round(+val * 10))});

      return acc;
    }, []);

    this.storage.set(this.uidTrackPitchKey, parsedSegments);
  }
}

export { AudioAnalysisService };
