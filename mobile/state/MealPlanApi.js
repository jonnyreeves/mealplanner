export default class MealPlanApi {
  constructor({ apiRoot, useProxy }) {
    this._apiRootUrl = apiRoot;
    this._useProxy = useProxy;

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

  setAccessToken(v) {
    this._accessToken = v;
  }

  _apiRoot() {
    let url = this._apiRootUrl;
    if (this._useProxy) {
      url = `http://localhost:1234/${url}`;
    }
    return url;
  }

  async _makeRequest({ resource, postData }) {
    const url = this._apiRoot() + resource;
    const method = (postData) ? 'post' : 'get';
    console.log(`Making Request, method=${method}, resource=${resource}`);

    const response = await fetch(url, {
      method,
      headers: new Headers({ Authorization: `Bearer ${this._accessToken}` }),
      body: postData ? JSON.stringify(postData) : undefined,
    });
    return response.json();
  }
}
