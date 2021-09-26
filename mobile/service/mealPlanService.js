class MealPlanService {
  constructor({ apiRoot, useProxy }) {
    this._apiRoot = apiRoot;
    this._useProxy = useProxy;
  }

  setAccessToken(v) {
    this._accessToken = v;
  }

  apiRoot() {
    let url = this._apiRoot;
    if (this._useProxy) {
      url = url.replace('https://script.google.com/', 'http://localhost:8010/proxy/');
    }
    return url;
  }

  getPlan() {
    if (this._cachedGetPlanPromise) {
      return this._cachedGetPlanPromise;
    }
    this._cachedGetPlanPromise = this.makeRequest({ resource: '/plan' });
    return this._cachedGetPlanPromise;
  }

  makeRequest({ resource }) {
    const url = this.apiRoot() + resource;
    console.log('Making Request, url:', url);

    return fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${this._accessToken}`,
      }),
    })
      .then((response) => response.json());
  }
}

export default MealPlanService;
