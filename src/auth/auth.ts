import * as config from '../../config';
import { generateRandomString, parseHashParams, Storage } from '../utils';

class Auth {
  private authScopes: String[];
  private authURL: string;
  private clientId: string;
  private parseHash: Function;
  private redirectUri: string;
  private refreshTimer: any;
  private state: string;
  private storage: Storage;
  private uidProgressKey: string;
  private uidStateKey: string;
  private uidTokenExpiryKey: string;
  private uidTokenKey: string;
  private uidTrackDurationKey: string;
  private uidTrackIdKey: string;
  private uidTrackPitchKey: string;
  private url: string;

  constructor() {
    this.authScopes = [
      'user-read-playback-state',
      'user-read-currently-playing'
    ];
    this.authURL = config.SPOTIFY_LOGIN_PATH;
    this.clientId = config.CLIENT_ID;
    this.parseHash = parseHashParams;
    this.redirectUri = config.REDIRECT_URI;
    this.state = generateRandomString(16);
    this.storage = new Storage();
    this.uidProgressKey = config.UID_PROGRESS_KEY;
    this.uidStateKey = config.UID_STATE_KEY;
    this.uidTokenExpiryKey = config.UID_TOKEN_EXPIRY_KEY;
    this.uidTokenKey = config.UID_TOKEN_KEY;
    this.uidTrackDurationKey = config.UID_TRACK_DURATION_KEY;
    this.uidTrackIdKey = config.UID_TRACK_ID_KEY;
    this.uidTrackPitchKey = config.UID_TRACK_PITCH_KEY;
    this.url = this.getUrl();

    this.init();
  }

  private init(): void {
    const hash = this.parseHash();
    const state = this.storage.get(this.uidStateKey);

    if (hash && hash.state === state) {
      this.storage.remove(this.uidStateKey);
      this.storage.set(this.uidTokenExpiryKey, new Date(new Date().getTime() + (hash.expires_in * 1000)).getTime());
      this.storage.set(this.uidTokenKey, hash.access_token);

      window.location.hash = '';
    }

    if (this.isLoggedIn()) {
      this.loginRefresh();
    }
  }

  private redirect(): void {
    window.location.href = this.getUrl();
  }

  public login(): void {
    this.storage.set(this.uidStateKey, this.state);
    this.redirect();
  }

  public logout(): void {
    this.storage.remove(this.uidStateKey);
    this.storage.remove(this.uidTokenExpiryKey);
    this.storage.remove(this.uidTokenKey);
    this.storage.remove(this.uidTrackIdKey);
    this.storage.remove(this.uidTrackPitchKey);
    this.storage.remove(this.uidProgressKey);
    this.storage.remove(this.uidTrackDurationKey);

    clearTimeout(this.refreshTimer);

    window.location.href = this.redirectUri;
  }

  public isLoggedIn(): boolean {
    return !!(this.storage.get(this.uidTokenKey) && this.storage.get(this.uidTokenExpiryKey) > new Date().getTime());
  }

  private loginRefresh(): void {
    this.refreshTimer = setInterval(() => {
      const timeDiff: number = 3e5;
      if (timeDiff < ((this.storage.get(this.uidTokenExpiryKey) as number) - new Date().getTime())) {
        return;
      }

      this.state = generateRandomString(16);
      this.login();
    }, 1e4);
  }

  private getUrl(): string {
    return `${this.authURL}?client_id=${this.clientId}&response_type=token&scope=${this.authScopes.join('%20')}&redirect_uri=${this.redirectUri}&state=${this.state}`;
  }
}

export { Auth };
