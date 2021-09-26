export class MealPlanApi {
    #accessToken
    #apiRoot
    #useProxy
    #cachedGetPlanPromise

    constructor({ apiRoot, useProxy }) {
        this.#apiRoot = apiRoot
        this.#useProxy = useProxy
    }

    setAccessToken(v) {        
        this.#accessToken = v;
    }

    apiRoot() {
        let url = this.#apiRoot;
        if (this.#useProxy) {
            url = url.replace("https://script.google.com/", "http://localhost:8010/proxy/");
        }
        return url;
    }

    getPlan() {
        if (this.#cachedGetPlanPromise) {
            console.log("Returning cached plan");
            return this.#cachedGetPlanPromise;
        }
        this.#cachedGetPlanPromise = this.makeRequest({ resource: "/plan"})
        return this.#cachedGetPlanPromise;
    }

    makeRequest({ resource }) {
        const url = this.apiRoot() + resource
        console.log("Making Request, url:", url);

        return fetch(url, {
            headers: new Headers({
                'Authorization': 'Bearer ' + this.#accessToken
            }),
        })
        .then(response => response.json());
    }
}

