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
  constructor({ method, pathParts, requestParams }) {
    this.method = method;
    this.pathParts = pathParts;
    this.requestParams = requestParams;
  }

  getJsonPayload() {
    try {
      return JSON.parse(this.requestParams.postData.contents);
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
      return HtmlService.createHtmlOutput(`<pre>${this.marshallTextOutput(true)}</pre>`);
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
    return new HttpHandler({ db: MealPlannerDb.init() }).doReq(e, method);
  }

  constructor({ db }) {
    this._db = db;
  }

  doReq(e, method) {
    const { pathInfo = '', parameters } = e;
    const pathParts = pathInfo.split('/');

    const req = new HttpRequest({
      method,
      pathParts,
      requestParams: e,
    });

    const resp = new HttpResponse();

    switch (pathParts[0]) {
      case 'plan':
        this.doPlanRequest(req, resp);
        break;
      case 'recipes':
        this.doRecipesRequest(req, resp);
        break;
      default:
        resp.setContent(req);
        break;
    }

    return resp.toOutput({ debug: parameters.debug });
  }

  doPlanRequest(req, resp) {
    const [, reqAction] = req.pathParts;

    if (req.method === 'post') {
      if (reqAction !== undefined) {
        throw new Error(`POST request made to unsupported endpoint: '/plan/${reqAction}'`);
      }
      return this.doModifyPlanRequest(req, resp);
    }

    switch (reqAction) {
      case 'by-days':
        return this.doPlanByDaysRequest(req, resp);
      case 'by-range':
        return this.doPlanByRangeRequest(req, resp);
      case undefined: // handles '/plan' route.
        return resp.setContent(this._db.getPlan());
      default:
        throw new Error(`GET request made to unsupported endpoint: '/plan/${reqAction}'`);
    }
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
    const [, , reqNumDays] = req.pathParts;
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
    const [, , reqStart, reqEnd] = req.pathParts;
    assert.assertIsoDate(reqStart, 'plan/by-range', 'start date');
    assert.assertIsoDate(reqEnd, 'plan/by-range', 'end date');

    resp.setContent(this._db.getPlanByRange(reqStart, reqEnd));
  }

  doRecipesRequest(req, resp) {
    return resp.setContent(this._db.getAllRecipes());
  }
}
