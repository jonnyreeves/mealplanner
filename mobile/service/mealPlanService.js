class MealPlanService {
  constructor({ apiRoot, useProxy }) {
    this._apiRoot = apiRoot;
    this._useProxy = useProxy;
    this._promiseCache = {};
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
    return this._makeCachedRequest('/plan');
  }

  getRecipes() {
    return this._makeCachedRequest('/recipes');
  }

  _makeCachedRequest(resource) {
    if (!this._promiseCache[resource]) {
      this._promiseCache[resource] = this.makeRequest({ resource });
    }
    return this._promiseCache[resource];
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
