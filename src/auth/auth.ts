import { CLIENT_ID, REDIRECT_URI, SPOTIFY_LOGIN_PATH, UID_TOKEN_KEY } from '../config';
import { generateRandomString, parseHashParams, Storage } from '../utils';

class Auth {
  private authURL: string = SPOTIFY_LOGIN_PATH;
  private authScopes: String[] = [
    'user-read-playback-state',
  ];
  private clientId: string = CLIENT_ID;
  private parseHash: Function = parseHashParams;
  private redirectUri: string = REDIRECT_URI;
  private state: string = generateRandomString(16);
  private storage: Storage = new Storage();
  private uidTokenKey: string = UID_TOKEN_KEY;
  private url: string = `${this.authURL}?client_id=${this.clientId}&response_type=token&scope=${this.authScopes.join('%20')}&redirect_uri=${this.redirectUri}&state=${this.state}`;

  public login(): void {
    this.storage.set('state', this.state);
    this.redirect();

    return void 0;
  }

  public isLoggedIn(): boolean {


    return !!this.storage.get(this.uidTokenKey);
  }

  private redirect(): void {
    window.location.href = this.url;
    return void 0;
  }

}

export { Auth };

