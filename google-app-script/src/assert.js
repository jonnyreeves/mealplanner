/* global dateUtils */
// eslint-disable-next-line no-unused-vars
const assert = {
  assertMethodParam(methodName, actual, supported) {
    if (!supported.some((v) => v === actual)) {
      throw new Error(this.formatInvalidApiRequestError(methodName, `expected one of (${supported.join(',')}), but got '${actual}'`));
    }
  },

  assertIsoDate(v, methodName, ctxStr) {
    if (!dateUtils.isShortISOString(v)) {
      throw new Error(this.formatInvalidApiRequestError(methodName), `expected ${ctxStr} to be formatted YYYY-MM-DD, but was '${v}'`);
    }
  },

  formatInvalidApiRequestError(methodName, message) {
    return `Invalid API request parameters. API method '${methodName}' ${message}`;
  },
};
