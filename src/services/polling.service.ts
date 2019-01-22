import Axios, { AxiosAdapter } from 'axios';
import * as config from '../../config';
import { Auth } from '../auth/auth';
import { Storage } from '../utils';
import { AudioAnalysisService } from './audioAnalysis.service';
import { Visualizer } from '../visualizer';

/**
 *
 *
 * @class PollingService
 */
class PollingService {
  private audioAnalysis: AudioAnalysisService;
  private auth: Auth;
  private axios: AxiosAdapter;
  private nowPlayingEl: HTMLElement | null;
  private polling: any; // interval
  private pollingTime: number = 5000; // time in ms
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
    this.axios = Axios;
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

  /**
   * Starts the polling if the user
   * is currently logged in.
   *
   * @private
   * @returns {void}
   * @memberof PollingService
   */
  private init(): void {
    if (!this.auth.isLoggedIn()) {
      return void 0;
    }

    this.startPolling();
  }


  /**
   * Polls the currently-playing end-point
   * for what the user is currently playing.
   *
   * @private
   * @memberof PollingService
   */
  private startPolling(): void {
    this.polling = setInterval(() => {
      if (!this.auth.isLoggedIn()) {
        this.stopPolling();
        return void 0;
      }

      this.getData();
    }, this.pollingTime);
  }


  /**
   * Stops polling and the visualizer.
   *
   * @private
   * @memberof PollingService
   */
  private stopPolling(): void {
    clearInterval(this.polling);
    this.visualizer.stop();
  }

  /**
   * Parses the data returned from the
   * polling request and determines
   * if it needs to init or top the
   * visualizer.
   *
   * @private
   * @param {*} { data }
   * @returns {void}
   * @memberof PollingService
   */
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
    this.getData();
  }

  /**
   * Sets the current playing track
   * Song + Artist in the top of the browser.
   *
   * @private
   * @param {*} data
   * @memberof PollingService
   */
  private nowPlayingTrack(data: any): void {
    if (this.nowPlayingEl) {
      const artists = data.item.artists.reduce((acc: string, val: any, idx: number) => acc += idx === data.item.artists.length - 1 ? val.name : `${val.name}, `, '');
      this.nowPlayingEl.innerText = `${data.item.name} - ${artists}`;
    }
  }

  /**
   * Gets the data from the Spotify API
   * about the currently playing track.
   *
   * @private
   * @memberof PollingService
   */
  private getData(): void {
    this.axios({
      url: `${this.url}/me/player/currently-playing`,
      headers: {
        'Authorization': `Bearer ${this.storage.get(this.uidTokenKey)}`
      }
    }).then((data) => {
      this.parseData(data);
    });
  }
}

export { PollingService };
