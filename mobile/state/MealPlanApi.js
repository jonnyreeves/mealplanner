import { doRefresh } from './auth';

export default class MealPlanApi {
  constructor({ apiRoot, useProxy }) {
    this._apiRootUrl = apiRoot;
    this._useProxy = useProxy;

    this._accessToken = '';
    this._queuedRequests = [];

    this._listenerMap = {
      recipes_fetched: [],
      plan_fetched: [],
    };
  }

  addListener(eventName, handlerFn) {
    this._listenerMap[eventName].push(handlerFn);
  }

  async fetchPlan() {
    const response = await this._makeRequest({ resource: '/plan' });
    this._listenerMap.plan_fetched.forEach((handlerFn) => handlerFn(response));
  }

  async fetchRecipes() {
    const response = await this._makeRequest({ resource: '/recipes' });
    this._listenerMap.recipes_fetched.forEach((handlerFn) => handlerFn(response));
  }

  async updateRecipe(recipeId, fields) {
    const postData = { version: '1.0', fields };
    return this._makeRequest({ resource: `/recipe/${recipeId}`, postData });
  }

  async updatePlan(entryMap) {
    const postData = { version: '1.0', entryMap };
    return this._makeRequest({ resource: '/plan', postData });
  }

  setAccessToken(at) {
    this._accessToken = at;
  }

  _apiRoot() {
    let url = this._apiRootUrl;
    if (this._useProxy) {
      url = `http://localhost:1234/${url}`;
    }
    return url;
  }

  async _refreshAccessToken() {
    this._isRefreshingToken = true;
    this._refreshPromise = new Promise((resolve, reject) => {
      console.log('refreshing access token...');
      doRefresh()
        .then((result) => {
          if (result.accessToken) {
            this._accessToken = result.accessToken;
          } else {
            this._accessToken = '';
          }
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  async _makeRequest({ resource, postData }) {
    return new Promise((resolve, reject) => {
      const url = this._apiRoot() + resource;
      const method = (postData) ? 'post' : 'get';

      const execReq = ({ withRefresh, retryCount }) => {
        console.log(`Making Request, method=${method}, resource=${resource}, retryCount=${retryCount} withRefresh=${withRefresh}`);
        return fetch(url, {
          method,
          headers: new Headers({ Authorization: `Bearer ${this._accessToken}` }),
          body: postData ? JSON.stringify(postData) : undefined,
        })
          .then((response) => {
            if (response.ok) {
              response.json().then((data) => resolve(data));
            } else if (response.status === 401) {
              if (!withRefresh) {
                reject(new Error('Request status was 401 but withRefresh was false'));
              } else {
                if (!this._isRefreshingToken) {
                  this._refreshAccessToken();
                }
                this._refreshPromise
                  .then(() => execReq({ withRefresh: false, retryCount }))
                  .catch((err) => reject(err));
              }
            } else if (retryCount >= 2) {
              reject(new Error(`Request failed, status=${response.status}, retryCount=${retryCount}`));
            } else {
              setTimeout(() => execReq({ withRefresh, retryCount: retryCount + 1 }), 2000 * (retryCount + 1));
            }
          });
      };

      execReq({ withRefresh: true, retryCount: 0 });
    });
  }
}
