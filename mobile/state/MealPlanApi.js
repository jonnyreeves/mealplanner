import { doRefresh } from './auth';
import { timeout } from '../utils';

export default class MealPlanApi {
  constructor({ apiRoot, useProxy }) {
    this._apiRootUrl = apiRoot;
    this._useProxy = useProxy;

    this._accessToken = '';
    this._refreshPromise = null;

    this._listenerMap = {
      recipes_fetched: [],
      plan_fetched: [],
      api_error: [],
    };
  }

  addListener(eventName, handlerFn) {
    this._listenerMap[eventName].push(handlerFn);
  }

  async fetchPlan() {
    try {
      const response = await this._makeRequest({ resource: '/plan' });
      this._listenerMap.plan_fetched.forEach((handlerFn) => handlerFn(response));
    } catch (err) {
      console.error(err);
      this._listenerMap.api_error.forEach((handlerFn) => handlerFn(err));
    }
  }

  async fetchRecipes() {
    try {
      const response = await this._makeRequest({ resource: '/recipes' });
      this._listenerMap.recipes_fetched.forEach((handlerFn) => handlerFn(response));
    } catch (err) {
      console.error(err);
      this._listenerMap.api_error.forEach((handlerFn) => handlerFn(err));
    }
  }

  async createRecipe(fields) {
    const postData = { version: '1.0', fields };
    return this._makeRequest({ resource: '/recipe', postData });
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
    if (!this._refreshPromise) {
      this._refreshPromise = new Promise((resolve, reject) => {
        console.log('refreshing access token...');
        doRefresh()
          .then((refreshRes) => {
            if (refreshRes.accessToken) {
              this._accessToken = refreshRes.accessToken;
              console.log('access token refreshed');
              resolve();
            } else {
              reject(new Error('No access token supplied in result'));
            }
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            this._refreshPromise = null;
          });
      });
    }
    return this._refreshPromise;
  }

  async _makeRequest({ resource, postData }) {
    const url = this._apiRoot() + resource;
    const method = (postData) ? 'post' : 'get';

    const execReq = async ({ withRefresh, retryCount }) => {
      const retryOrFail = async (res) => {
        if (retryCount >= 2) {
          throw new Error(`Request failed, resource=${resource} status=${res?.status || 0}, retryCount=${retryCount}`);
        } else {
          await timeout(2000 * (retryCount + 1));
          return execReq({ withRefresh, retryCount: retryCount + 1 });
        }
      };

      console.log(`Making Request, method=${method}, resource=${resource}, retryCount=${retryCount} withRefresh=${withRefresh}`);

      try {
        const fetchRes = await fetch(url, {
          method,
          headers: new Headers({ Authorization: `Bearer ${this._accessToken}` }),
          body: postData ? JSON.stringify(postData) : undefined,
        });

        if (fetchRes.ok && fetchRes.headers.get('content-type').includes('application/json')) {
          return await fetchRes.json();
        } if (fetchRes.status === 401) {
          if (!withRefresh) {
            throw new Error('Request status was 401 but withRefresh was false');
          }
          try {
            await this._refreshAccessToken();
          } catch (err) {
            throw new Error(`Request failed due to refresh exchange failure: ${err}`);
          }
          return execReq({ withRefresh, retryCount });
        }
        return retryOrFail(fetchRes);
      } catch (err) {
        return retryOrFail(null);
      }
    };

    return execReq({ withRefresh: true, retryCount: 0 });
  }
}
