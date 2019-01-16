import Axios, { AxiosAdapter } from 'axios';
import { Auth } from '../auth/auth';
import * as config from '../config';
import { Storage } from '../utils';

class AudioAnalysisService {
  private axios: AxiosAdapter;
  private auth: Auth;
  private memoryCache: [];

  constructor() {
    this.axios = Axios;
    this.auth = new Auth();
    this.memoryCache = [];
  }
}

export { AudioAnalysisService };
