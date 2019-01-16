import { Auth } from './auth/auth';
import { PollingService } from './services';

class App {
  private auth: Auth;
  private polling: PollingService;
  private loginBtn: any;
  private logoutBtn: any;
  private viz: any;

  constructor() {
    this.auth = new Auth();
    this.polling = new PollingService();
    this.loginBtn = document.getElementById('login');
    this.logoutBtn = document.getElementById('logout');
    this.viz = document.getElementsByClassName('viz')[0];

    this.init();
  }

  private init(): void {
    if (this.auth.isLoggedIn()) {
      this.loginBtn.classList.add('hide');
      this.logoutBtn.classList.remove('hide');
      this.viz.classList.remove('hide');
    }

    this.loginBtn.onclick = () => {
      this.auth.login();
    };

    this.logoutBtn.onclick = () => {
      this.auth.logout();
    };
  }
}

new App();
