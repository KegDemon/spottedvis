import Axios, { AxiosAdapter } from 'axios';
import { Auth } from '../auth/auth';
import * as config from '../../config';
import { Storage } from '../utils';

class PollingService {
  private axios: AxiosAdapter = Axios;
  private auth: Auth;
  private polling: any; // interval
  private pollingTime: number = 10000; // time in ms
  private storage: Storage;
  private uidTokenKey: string;
  private uidTrackIdKey: string;
  private url: string;

  constructor() {
    this.auth = new Auth();
    this.storage = new Storage();
    this.uidTokenKey = config.UID_TOKEN_KEY;
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

    return void 0;
  }

  private stopPolling(): void {
    clearInterval(this.polling);

    return void 0;
  }

  private parseData({data}: any) {
    if (this.storage.get(this.uidTrackIdKey) === data.item.id) {
      return void 0;
    }

    this.storage.set(this.uidTrackIdKey, data.item.id);


  }
}

export { PollingService };
