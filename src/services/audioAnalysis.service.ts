import * as config from '../../config';
import { Storage } from '../utils';
import { WebWorkerService } from './webWorker.service';

/**
 *
 *
 * @class AudioAnalysisService
 */
class AudioAnalysisService {
  private dataResolve: Promise<void>;
  private dataResolvePromise: any;
  private storage: Storage;
  private trackId: string | null;
  private uidTokenKey: string;
  private uidTrackIdKey: string;
  private uidTrackPitchKey: string;
  private url: string;
  private webWorker: Worker | void;

  constructor() {
    this.dataResolve = new Promise<void>((resolve: any) => {
      this.dataResolvePromise = resolve;
    });
    this.storage = new Storage();
    this.trackId = null;
    this.uidTokenKey = config.UID_TOKEN_KEY;
    this.uidTrackIdKey = config.UID_TRACK_ID_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;
    this.url = config.SPOTIFY_BASE_PATH;
    this.webWorker = new WebWorkerService().register();

    if (this.webWorker) {
      this.webWorker.onmessage = ({ data }: MessageEvent) => {
        this.storage.set(this.uidTrackPitchKey, data.data);
        this.dataResolvePromise();
      };
    }
  }

  /**
   * Fetches the current track's audio analysis
   * features from the Spotify API.
   *
   * @returns {void}
   * @memberof AudioAnalysisService
   */
  public get(): Promise<void | {}> {
    if (!this.webWorker)
      return Promise.reject({ status: 'error', message: 'No worker assigned' });

    this.trackId = this.storage.get(this.uidTrackIdKey) as string | null;
    this.storage.remove(this.uidTrackPitchKey);
    this.dataResolve = new Promise<void>((resolve: any) => {
      this.dataResolvePromise = resolve;
    });

    this.webWorker.postMessage({
      type: 'analysis',
      url: `${this.url}/audio-analysis/${this.trackId}`,
      token: this.storage.get(this.uidTokenKey)
    });

    return this.dataResolve;
  }
}

export { AudioAnalysisService };
