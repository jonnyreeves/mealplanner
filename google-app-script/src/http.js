/* global dateUtils, MealPlannerDb */

// The following comment is required to fix OAuth issues w/ Google App Scripts
// DriveApp.getFiles()

// eslint-disable-next-line no-unused-vars
function doPost(e) {
  return doReq(e, 'post');
}

// eslint-disable-next-line no-unused-vars
function doGet(e) {
  return doReq(e, 'get');
}

function doReq(e, method) {
  const { pathInfo = '', parameters } = e;
  const pathParts = pathInfo.split('/');

  const reqCtx = {
    method,
    pathParts,
    requestParams: e,
    db: MealPlannerDb.init(),
  };

  let resp;
  switch (pathParts[0]) {
    case 'plan':
      resp = doPlanRequest(reqCtx);
      break;
    case 'find':
      resp = doFindRequest(reqCtx);
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

function doPlanRequest(reqCtx) {
  const [, reqAction] = reqCtx.pathParts;

  if (reqCtx.method === 'post') {
    if (reqAction !== undefined) {
      throw new Error(`POST request made to unsupported endpoint: '/plan/${reqAction}'`);
    }
    return doModifyPlanRequest(reqCtx);
  }

  switch (reqAction) {
    case 'by-days':
      return doPlanByDaysRequest(reqCtx);
    case 'by-range':
      return doPlanByRangeRequest(reqCtx);
    case undefined: // handles '/plan' route.
      return JSON.stringify(reqCtx.db.getPlan());
    default:
      throw new Error(`GET request made to unsupported endpoint: '/plan/${reqAction}'`);
  }
}

function doModifyPlanRequest(reqCtx) {
  const reqData = parseReqData(reqCtx);

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
      const resp = reqCtx.db.setPlanEntry(date, entries[date]);
      if (!resp.success) {
        throw new Error(resp.message);
      }
    });
}

function doPlanByDaysRequest(reqCtx) {
  const [, , reqNumDays] = reqCtx.pathParts;
  const numDays = Number.parseInt(reqNumDays, 10);
  if (!(Number.isFinite(numDays) && numDays > 0)) {
    throw new Error(formatInvalidApiRequestError('plan/by-days', `expected number of days to be a positive integer value but got '${reqNumDays}'`));
  }

  const startDate = dateUtils.today();
  const endDate = dateUtils.addDays(startDate, numDays - 1);

  const meals = reqCtx.db.getPlanByRange(
    dateUtils.toShortISOString(startDate),
    dateUtils.toShortISOString(endDate),
  );

  return JSON.stringify(meals);
}

function doPlanByRangeRequest(reqCtx) {
  const [, , reqStart, reqEnd] = reqCtx.pathParts;
  assertIsoDate(reqStart, 'plan/by-range', 'start date');
  assertIsoDate(reqEnd, 'plan/by-range', 'end date');

  const meals = reqCtx.db.getPlanByRange(reqStart, reqEnd);

  return JSON.stringify(meals);
}

function doFindRequest(reqCtx) {
  const [, reqAction] = reqCtx.pathParts;
  assertMethodParam('find', reqAction, ['by-ingredient']);
  switch (reqAction) {
    case 'by-ingredient':
      return doFindByIngredientRequest(reqCtx);
    default:
      throw new Error('Invalid state');
  }
}

function doFindByIngredientRequest(reqCtx) {
  let [, , searchTerm] = reqCtx.pathParts;
  // TODO: assert SearchTerm
  searchTerm = decodeURIComponent(searchTerm);
  const results = reqCtx.db.getMealsByIngredient(searchTerm);
  return JSON.stringify(results);
}

function parseReqData(reqCtx) {
  try {
    return JSON.parse(reqCtx.requestParams.postData.contents);
  } catch (e) {
    throw new Error(`Error parsing POST request payload as JSON: '${e}'`);
  }
}

function assertMethodParam(methodName, actual, supported) {
  if (!supported.some((v) => v === actual)) {
    throw new Error(formatInvalidApiRequestError(methodName, `expected one of (${supported.join(',')}), but got '${actual}'`));
  }
}

function assertIsoDate(v, methodName, ctxStr) {
  if (!dateUtils.isShortISOString(v)) {
    throw new Error(formatInvalidApiRequestError(methodName), `expected ${ctxStr} to be formatted YYYY-MM-DD, but was '${v}'`);
  }
}

function formatInvalidApiRequestError(methodName, message) {
  return `Invalid API request parameters. API method '${methodName}' ${message}`;
}
