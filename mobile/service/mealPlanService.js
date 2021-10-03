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
      url = `http://localhost:1234/${url}`;
    }
    return url;
  }

  getPlan() {
    return this._makeCachedRequest('/plan');
  }

  getRecipes() {
    return this._makeCachedRequest('/recipes');
  }

  updatePlan(entryMap) {
    const postData = { version: '1.0', entryMap };
    return this.makeRequest({ resource: '/plan', postData });
  }

  _makeCachedRequest(resource) {
    if (!this._promiseCache[resource]) {
      this._promiseCache[resource] = this.makeRequest({ resource });
    }
    return this._promiseCache[resource];
  }

  makeRequest({ resource, postData }) {
    const url = this.apiRoot() + resource;
    const method = (postData) ? 'post' : 'get';
    console.log('Making Request, url:', url);

    return fetch(url, {
      method,
      headers: new Headers({
        Authorization: `Bearer ${this._accessToken}`,
      }),
      body: postData ? JSON.stringify(postData) : undefined,
    })
      .then((response) => response.json());
  }
}

export default MealPlanService;
