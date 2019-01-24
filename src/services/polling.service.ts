import EventEmitter from 'eventemitter3';
import * as config from '../../config';
import { Auth } from '../auth/auth';
import { Storage } from '../utils';
import { Visualizer } from '../visualizer';
import { AudioAnalysisService } from './audioAnalysis.service';

/**
 *
 *
 * @class PollingService
 */
class PollingService {
  private audioAnalysis: AudioAnalysisService;
  private auth: Auth;
  private eventemitter: EventEmitter;
  private nowPlayingEl: HTMLElement | null;
  private polling: any; // interval
  private pollingTime: number = 5000; // time in ms
  private storage: Storage;
  private timer: number;
  private uidProgressKey: string;
  private uidTokenKey: string;
  private uidTrackDurationKey: string;
  private uidTrackIdKey: string;
  private url: string;
  private visualizer: Visualizer;

  constructor() {
    this.audioAnalysis = new AudioAnalysisService();
    this.auth = new Auth();
    this.eventemitter = new EventEmitter();
    this.nowPlayingEl = document.getElementById('nowPlaying');
    this.storage = new Storage();
    this.timer = 0;
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
    this.eventemitter.on('event:poll', this.pollingData, this);
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
      this.eventemitter.emit('event:poll');
    }, this.pollingTime);
  }

  /**
   * Fetch the data for the polled event.
   *
   * @private
   * @returns {void}
   * @memberof PollingService
   */
  private pollingData(): void {
    if (!this.auth.isLoggedIn()) {
      this.stopPolling();
      return void 0;
    }

    this.getData();
  }

  /**
   * Stops polling and the visualizer.
   *
   * @private
   * @memberof PollingService
   */
  private stopPolling(): void {
    clearInterval(this.polling);
    this.polling = void 0;
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
  private parseData(data: any): void {
    if (data.currently_playing_type !== 'track') {
      return void 0;
    }

    this.storage.set(this.uidProgressKey, +((data.progress_ms + +(performance.now() - this.timer).toFixed(3)) / 1000).toFixed(2));
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
    this.audioAnalysis.get()
    .then(() => {
        this.getData();
        this.visualizer.start();
      });
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
    this.timer = performance.now();
    fetch(`${this.url}/me/player/currently-playing`, {
      headers: {
        'Authorization': `Bearer ${this.storage.get(this.uidTokenKey)}`
      }
    })
      .then((data: Response): {} => data.json())
      .then((data: any) => {
        this.parseData(data);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  }
}

export { PollingService };

