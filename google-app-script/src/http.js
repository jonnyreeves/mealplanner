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

    const reqCtx = {
      method,
      pathParts,
      requestParams: e,
    };

    let resp;
    switch (pathParts[0]) {
      case 'plan':
        resp = this.doPlanRequest(reqCtx);
        break;
      case 'recipes':
        resp = this.doRecipesRequest(reqCtx);
        break;
      default:
        resp = JSON.stringify({ reqCtx });
        break;
    }

    if (parameters.debug) {
      return HtmlService.createHtmlOutput(resp);
    }
    return ContentService
      .createTextOutput(resp)
      .setMimeType(ContentService.MimeType.JSON);
  }

  doPlanRequest(reqCtx) {
    const [, reqAction] = reqCtx.pathParts;

    if (reqCtx.method === 'post') {
      if (reqAction !== undefined) {
        throw new Error(`POST request made to unsupported endpoint: '/plan/${reqAction}'`);
      }
      return this.doModifyPlanRequest(reqCtx);
    }

    switch (reqAction) {
      case 'by-days':
        return this.doPlanByDaysRequest(reqCtx);
      case 'by-range':
        return this.doPlanByRangeRequest(reqCtx);
      case undefined: // handles '/plan' route.
        return JSON.stringify(this._db.getPlan());
      default:
        throw new Error(`GET request made to unsupported endpoint: '/plan/${reqAction}'`);
    }
  }

  doModifyPlanRequest(reqCtx) {
    const reqData = this.parseReqData(reqCtx);
    /*
    {
      version: "1.0",
      entryMap: {
        "2021-09-21": { lunch: "foo", dinner: "bar", note: "hello" }
      }
    }
    */
    const entries = reqData.entryMap || {};
    Object.keys(entries)
      .forEach((date) => {
        const resp = this._db.setPlanEntry(date, entries[date]);
        if (!resp.success) {
          throw new Error(resp.message);
        }
      });
  }

  doPlanByDaysRequest(reqCtx) {
    const [, , reqNumDays] = reqCtx.pathParts;
    const numDays = Number.parseInt(reqNumDays, 10);
    if (!(Number.isFinite(numDays) && numDays > 0)) {
      throw new Error(assert.formatInvalidApiRequestError('plan/by-days', `expected number of days to be a positive integer value but got '${reqNumDays}'`));
    }

    const startDate = dateUtils.today();
    const endDate = dateUtils.addDays(startDate, numDays - 1);

    const meals = this._db.getPlanByRange(
      dateUtils.toShortISOString(startDate),
      dateUtils.toShortISOString(endDate),
    );

    return JSON.stringify(meals);
  }

  doPlanByRangeRequest(reqCtx) {
    const [, , reqStart, reqEnd] = reqCtx.pathParts;
    assert.assertIsoDate(reqStart, 'plan/by-range', 'start date');
    assert.assertIsoDate(reqEnd, 'plan/by-range', 'end date');

    const meals = this._db.getPlanByRange(reqStart, reqEnd);

    return JSON.stringify(meals);
  }

  doRecipesRequest() {
    return JSON.stringify(this._db.getAllRecipes());
  }

  parseReqData(reqCtx) {
    try {
      return JSON.parse(reqCtx.requestParams.postData.contents);
    } catch (e) {
      throw new Error(`Error parsing POST request payload as JSON: '${e}'`);
    }
  }
}
