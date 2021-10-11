function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = Math.random() * 16 | 0; const
      // eslint-disable-next-line no-bitwise, no-mixed-operators
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const dateUtils = {
  today() {
    let d = new Date();
    const offset = d.getTimezoneOffset();
    d = new Date(d.getTime() - (offset * 60 * 1000));
    dateUtils.zeroHMS(d);
    return d;
  },

  daysBetween(start, end) {
    const diffMs = end - start;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  },

  addDays(d, days) {
    const result = new Date(d);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  },

  toShortISOString(d) {
    return d.toISOString().split('T')[0];
  },

  isShortISOString(str) {
    return /[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(str);
  },

  fromISOString(isoStr) {
    const res = new Date(isoStr);
    dateUtils.zeroHMS(res);
    return res;
  },

  zeroHMS(d) {
    d.setUTCHours(0);
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);
    d.setUTCMilliseconds(0);
  },
};
