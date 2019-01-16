import * as config from '../../config';
import { generateRandomString, parseHashParams, Storage } from '../utils';

class Auth {
  private authScopes: String[] = [
    'user-read-playback-state',
    'user-read-currently-playing'
  ];
  private authURL: string = config.SPOTIFY_LOGIN_PATH;
  private clientId: string = config.CLIENT_ID;
  private parseHash: Function = parseHashParams;
  private redirectUri: string = config.REDIRECT_URI;
  private state: string = generateRandomString(16);
  private storage: Storage = new Storage();
  private uidProgressKey: string = config.UID_PROGRESS_KEY;
  private uidStateKey: string = config.UID_STATE_KEY;
  private uidTokenExpiryKey: string = config.UID_TOKEN_EXPIRY_KEY;
  private uidTokenKey: string = config.UID_TOKEN_KEY;
  private uidTrackDurationKey: string = config.UID_TRACK_DURATION_KEY;
  private uidTrackIdKey: string = config.UID_TRACK_ID_KEY;
  private uidTrackPitchKey: string = config.UID_TRACK_PITCH_KEY;
  private url: string = `${this.authURL}?client_id=${this.clientId}&response_type=token&scope=${this.authScopes.join('%20')}&redirect_uri=${this.redirectUri}&state=${this.state}`;

  constructor() {
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
  }

  private redirect(): void {
    window.location.href = this.url;
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

    window.location.href = this.redirectUri;
  }

  public isLoggedIn(): boolean {
    return !!(this.storage.get(this.uidTokenKey) && this.storage.get(this.uidTokenExpiryKey) > new Date().getTime());
  }
}

export { Auth };
