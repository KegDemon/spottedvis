import Axios, { AxiosAdapter } from 'axios';
import * as config from '../../config';
import { Auth } from '../auth/auth';
import { Storage } from '../utils';
import { AudioAnalysisService } from './audioAnalysis.service';
import { Visualizer } from '../visualizer';

class PollingService {
  private audioAnalysis: AudioAnalysisService;
  private auth: Auth;
  private axios: AxiosAdapter = Axios;
  private nowPlayingEl: HTMLElement | null;
  private polling: any; // interval
  private pollingTime: number = 1500; // time in ms
  private storage: Storage;
  private uidProgressKey: string;
  private uidTokenKey: string;
  private uidTrackDurationKey: string;
  private uidTrackIdKey: string;
  private url: string;
  private visualizer: Visualizer;

  constructor() {
    this.audioAnalysis = new AudioAnalysisService();
    this.auth = new Auth();
    this.nowPlayingEl = document.getElementById('nowPlaying');
    this.storage = new Storage();
    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidTokenKey = config.UID_TOKEN_KEY;
    this.uidTrackDurationKey = config.UID_TRACK_DURATION_KEY;
    this.uidTrackIdKey = config.UID_TRACK_ID_KEY;
    this.url = config.SPOTIFY_BASE_PATH;
    this.visualizer = new Visualizer();

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
    if (data.currently_playing_type !== 'track') {
      return void 0;
    }

    this.storage.set(this.uidProgressKey, data.progress_ms / 1000);
    this.storage.set(this.uidTrackDurationKey, data.item.duration_ms);

    if (data.is_playing && !this.visualizer.isActive()) {
      this.visualizer.start();
      this.nowPlayingTrack(data);
    }

    if (!data.is_playing) {
      this.visualizer.stop();
    }

    if (this.storage.get(this.uidTrackIdKey) === data.item.id) {
      return void 0;
    } else {
      this.visualizer.stop();
    }

    this.nowPlayingTrack(data);
    this.storage.set(this.uidTrackIdKey, data.item.id);
    this.audioAnalysis.get();
  }

  private nowPlayingTrack(data: any): void {
    if (this.nowPlayingEl) {
      const artists = data.item.artists.reduce((acc: string, val: any, idx: number) => acc += idx === data.item.artists.length - 1 ? val.name : `${val.name}, `, '');
      this.nowPlayingEl.innerText = `${data.item.name} - ${artists}`;
    }
  }
}

export { PollingService };
