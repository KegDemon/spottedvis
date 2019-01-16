import { Auth } from './auth/auth';

class App {
  private auth: Auth;
  private loginBtn: any;

  constructor() {
    this.auth = new Auth();
    this.loginBtn = document.getElementById('login');

    this.init();
  }

  private init(): void {
    this.loginBtn.onclick = () => {
      this.auth.login();
    };
  }
}

new App();
