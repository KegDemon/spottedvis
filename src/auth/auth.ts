import * as config from '../../config';
import { generateRandomString, parseHashParams, Storage } from '../utils';

class Auth {
  private authURL: string = config.SPOTIFY_LOGIN_PATH;
  private authScopes: String[] = [
    'user-read-playback-state',
    'user-read-currently-playing'
  ];
  private clientId: string = config.CLIENT_ID;
  private parseHash: Function = parseHashParams;
  private redirectUri: string = config.REDIRECT_URI;
  private state: string = generateRandomString(16);
  private storage: Storage = new Storage();
  private uidStateKey: string = config.UID_STATE_KEY;
  private uidTokenKey: string = config.UID_TOKEN_KEY;
  private uidTokenExpiryKey: string = config.UID_TOKEN_EXPIRY_KEY
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

      window.location.href = this.redirectUri;
    }

    return void 0;
  }

  private redirect(): void {
    window.location.href = this.url;
    return void 0;
  }

  public login(): void {
    this.storage.set(this.uidStateKey, this.state);
    this.redirect();

    return void 0;
  }

  public isLoggedIn(): boolean {
    return !!(this.storage.get(this.uidTokenKey) && this.storage.get(this.uidTokenExpiryKey) > new Date().getTime());
  }
}

export { Auth };
