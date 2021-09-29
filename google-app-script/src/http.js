/* global dateUtils, assert, MealPlannerDb */

// The following comment is required to fix OAuth issues w/ Google App Scripts
// DriveApp.getFiles()

// eslint-disable-next-line no-unused-vars
function doPost(e) {
  return HttpHandler.serveDefault(e, 'post');
}

// eslint-disable-next-line no-unused-vars
function doGet(e) {
  return HttpHandler.serveDefault(e, 'get');
}

class HttpRequest {
  constructor({ method, requestEvent }) {
    this._method = method;
    this._requestEvent = requestEvent;
  }

  isPost() {
    return this._method === 'post';
  }

  getPath() {
    return this._requestEvent.pathInfo || '';
  }

  getPathParts() {
    return this.getPath().split('/');
  }

  getParam(key) {
    return this._requestEvent.parameters[key];
  }

  getJsonPayload() {
    try {
      return JSON.parse(this._requestEvent.postData.contents);
    } catch (err) {
      throw new Error(`Error parsing POST request payload as JSON: '${err}'`);
    }
  }
}

class HttpResponse {
  constructor() {
    this._mimeType = ContentService.MimeType.JSON;
    this._content = null;
  }

  setContent(v) {
    this._content = v;
  }

  setMimeType(v) {
    this._mimeType = v;
  }

  toOutput({ debug }) {
    if (debug) {
      return HtmlService
        .createHtmlOutput(`<pre>${this.marshallTextOutput(true)}</pre>`);
    }
    return ContentService
      .createTextOutput(this.marshallTextOutput())
      .setMimeType(this._mimeType);
  }

  marshallTextOutput(debug = false) {
    if (this._mimeType === ContentService.MimeType.JSON) {
      return JSON.stringify(this._content, '\t', debug ? 2 : 0);
    }
    return String(this._content);
  }
}

class HttpHandler {
  static serveDefault(e, method) {
    return new HttpHandler({
      db: MealPlannerDb.init(),
    }).doReq(e, method);
  }

  constructor({ routerMap, db }) {
    this._db = db;
    this._routerMap = routerMap || this.defaultRouterMap();
  }

  defaultRouterMap() {
    return {
      post: {
        plan: this.doModifyPlanRequest,
      },
      get: {
        plan: this.doPlanRequest2,
        'plan/by-days/*': this.doPlanByDaysRequest,
        'plan/by-range/*': this.doPlanByRangeRequest,
        recipes: this.doRecipesRequest,
      },
    };
  }

  doReq(requestEvent, method) {
    const req = new HttpRequest({ method, requestEvent });
    const resp = new HttpResponse();

    const handlerMap = req.isPost() ? this._routerMap.post : this._routerMap.get;
    const routePriority = Object.keys(handlerMap)
      .sort((a, b) => {
        const aLen = a.split('/').length;
        const bLen = b.split('/').length;
        if (aLen > bLen) return -1;
        if (aLen === bLen) return 0;
        return -1;
      });

    const handlerName = routePriority.find((r) => new RegExp(r).test(req.getPath()));
    if (handlerName) {
      handlerMap[handlerName].apply(this, [req, resp]);
    } else {
      this.doNoHandlerFound(req, resp);
    }

    return resp.toOutput({ debug: req.getParam('debug') });
  }

  doNoHandlerFound(req, resp) {
    return resp.setContent({ error: `No handler registered for route: ${req.getRoute()}` });
  }

  doPlanRequest2(req, resp) {
    return resp.setContent(this._db.getPlan());
  }

  doModifyPlanRequest(req, resp) {
    /*
    {
      version: "1.0",
      entryMap: {
        "2021-09-21": { lunch: "foo", dinner: "bar", note: "hello" }
      }
    }
    */
    const { entryMap = {} } = req.getJsonPayload();
    Object.keys(entryMap)
      .forEach((date) => {
        const result = this._db.setPlanEntry(date, entryMap[date]);
        if (!result.success) {
          throw new Error(result.message);
        }
      });
    resp.setContent({ message: 'ok' });
  }

  doPlanByDaysRequest(req, resp) {
    const [, , reqNumDays] = req.getPathParts();
    const numDays = Number.parseInt(reqNumDays, 10);
    if (!(Number.isFinite(numDays) && numDays > 0)) {
      throw new Error(assert.formatInvalidApiRequestError('plan/by-days', `expected number of days to be a positive integer value but got '${reqNumDays}'`));
    }

    const startDate = dateUtils.today();
    const endDate = dateUtils.addDays(startDate, numDays - 1);

    return resp.setContent(this._db.getPlanByRange(
      dateUtils.toShortISOString(startDate),
      dateUtils.toShortISOString(endDate),
    ));
  }

  doPlanByRangeRequest(req, resp) {
    const [, , reqStart, reqEnd] = req.getPathParts();
    assert.assertIsoDate(reqStart, 'plan/by-range', 'start date');
    assert.assertIsoDate(reqEnd, 'plan/by-range', 'end date');

    resp.setContent(this._db.getPlanByRange(reqStart, reqEnd));
  }

  doRecipesRequest(req, resp) {
    return resp.setContent(this._db.getAllRecipes());
  }
}
