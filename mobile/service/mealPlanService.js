/* eslint-disable no-param-reassign */
import wrapFetch from 'fetch-retry';

console.log(wrapFetch);
const fetchRetry = wrapFetch(fetch);

class MealPlanService {
  constructor({ apiRoot, useProxy }) {
    this._apiRoot = apiRoot;
    this._useProxy = useProxy;
    this._promiseCache = {};
    this._cachedPlan = null;
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
    const { promise, wasCached } = this._makeCachedRequest('/plan');
    if (!wasCached) {
      promise.then((data) => {
        this._cachedPlan = data;
      });
    }
    return promise;
  }

  getRecipes() {
    return this._makeCachedRequest('/recipes').promise;
  }

  updatePlan(entryMap) {
    console.log(entryMap);
    this._mutateCachedPlan(entryMap);
    const postData = { version: '1.0', entryMap };
    return this.makeRequest({ resource: '/plan', postData });
  }

  _mutateCachedPlan(entryMap) {
    this._cachedPlan?.forEach((item) => {
      const mutations = entryMap[item.date];
      if (mutations) {
        if ('lunch' in mutations) {
          item.lunch.name = mutations.lunch;
          item.lunch.recipe = null;
        }
        if ('dinner' in mutations) {
          item.dinner.name = mutations.dinner;
          item.dinner.recipe = null;
        }
      }
    });
  }

  _makeCachedRequest(resource) {
    let wasCached = true;
    if (!this._promiseCache[resource]) {
      wasCached = false;
      this._promiseCache[resource] = this.makeRequest({ resource });
    }
    return { promise: this._promiseCache[resource], wasCached };
  }

  makeRequest({ resource, postData }) {
    const url = this.apiRoot() + resource;
    const method = (postData) ? 'post' : 'get';
    console.log(`Making Request, method=${method}, resource=${resource}`);

    return fetchRetry(url, {
      method,
      headers: new Headers({
        Authorization: `Bearer ${this._accessToken}`,
      }),
      body: postData ? JSON.stringify(postData) : undefined,
    })
      .then((response) => response.json());
  }
}

export function usePlanModifers({ mealPlanService }) {
  const setMeal = ({ date, slot, recipeName }) => mealPlanService.updatePlan({
    [date]: { [slot]: recipeName },
  });
  const clearMeal = ({ date, slot }) => mealPlanService.updatePlan({
    [date]: { [slot]: '' },
  });
  const swapMeal = ({ src, dest }) => {
    let entryMap;
    if (src.date === dest.date) {
      entryMap = { [src.date]: { [src.slot]: dest.recipeName, [dest.slot]: src.recipeName } };
    } else {
      entryMap = {
        [src.date]: { [src.slot]: dest.recipeName },
        [dest.date]: { [dest.slot]: src.recipeName },
      };
    }
    return mealPlanService.updatePlan(entryMap);
  };
  return { setMeal, clearMeal, swapMeal };
}

export default MealPlanService;
