import { Auth } from './auth/auth';
import { PollingService } from './services';
import { fullScreen } from './utils';
import './styles/app.scss';

class App {
  private auth: Auth;
  private polling: PollingService;
  private fullscreen: any;
  private loginBtn: any;
  private logoutBtn: any;
  private fullscreenBtn: any;
  private nowPlaying: any;
  private vis: any;

  constructor() {
    this.auth = new Auth();
    this.polling = new PollingService();
    this.loginBtn = document.getElementById('login');
    this.logoutBtn = document.getElementById('logout');
    this.fullscreenBtn = document.getElementById('fullscreen');
    this.nowPlaying = document.getElementById('nowPlaying');
    this.fullscreen = fullScreen;
    this.vis = document.getElementsByClassName('vis')[0];

    this.init();
  }

  private init(): void {
    if (this.auth.isLoggedIn()) {
      this.loginBtn.classList.add('hide');
      this.logoutBtn.classList.remove('hide');
      this.fullscreenBtn.classList.remove('hide');
      this.vis.classList.remove('hide');
      this.nowPlaying.classList.remove('hide');
    } else {
      this.loginBtn.classList.remove('hide');
      this.logoutBtn.classList.add('hide');
      this.fullscreenBtn.classList.add('hide');
      this.vis.classList.add('hide');
      this.nowPlaying.classList.add('hide');
    }

    this.loginBtn.onclick = () => {
      this.auth.login();
    };

    this.logoutBtn.onclick = () => {
      this.auth.logout();
    };

    this.fullscreenBtn.onclick = () => {
      this.fullscreen();
    };
  }
}

new App();
