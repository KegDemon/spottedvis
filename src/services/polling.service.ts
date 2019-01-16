import Axios, { AxiosAdapter } from 'axios';
import * as config from '../../config';
import { Auth } from '../auth/auth';
import { Storage } from '../utils';
import { AudioAnalysisService } from './audio-analysis.service';
import { Visualizer } from '../visualizer';

class PollingService {
  private axios: AxiosAdapter = Axios;
  private audioAnalysis: AudioAnalysisService;
  private auth: Auth;
  private polling: any; // interval
  private pollingTime: number = 1000; // time in ms
  private uidProgressKey: string;
  private storage: Storage;
  private uidTokenKey: string;
  private uidTrackDurationKey: string;
  private uidTrackIdKey: string;
  private url: string;
  private visualizer: Visualizer;

  constructor() {
    this.audioAnalysis = new AudioAnalysisService();
    this.auth = new Auth();
    this.storage = new Storage();
    this.visualizer = new Visualizer();

    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidTokenKey = config.UID_TOKEN_KEY;
    this.uidTrackDurationKey = config.UID_TRACK_DURATION_KEY;
    this.uidTrackIdKey = config.UID_TRACK_ID_KEY;
    this.url = config.SPOTIFY_BASE_PATH;

    this.init();
  }

  private init(): void {
    if (!this.auth.isLoggedIn()) {
      return void 0;
    }

    this.startPolling();
  }

  private startPolling(): void {
    this.polling = setInterval(() => {
      if (!this.auth.isLoggedIn()) {
        this.stopPolling();
        return void 0;
      }

      this.axios({
        url: `${this.url}/me/player/currently-playing`,
        headers: {
          'Authorization': `Bearer ${this.storage.get(this.uidTokenKey)}`
        }
      }).then((data) => {
        this.parseData(data);
      });

    }, this.pollingTime);
  }

  private stopPolling(): void {
    clearInterval(this.polling);
    this.visualizer.stop();
  }

  private parseData({ data }: any): void {
    this.storage.set(this.uidProgressKey, data.progress_ms / 1000);
    this.storage.set(this.uidTrackDurationKey, data.item.duration_ms);

    if (data.is_playing && !this.visualizer.isActive()) {
      this.visualizer.start();
    }

    if (!data.is_playing) {
      this.visualizer.stop();
    }

    if (this.storage.get(this.uidTrackIdKey) === data.item.id) {
      return void 0;
    } else {
      this.visualizer.stop();
    }

    this.storage.set(this.uidTrackIdKey, data.item.id);
    this.audioAnalysis.get();
  }
}

export { PollingService };
