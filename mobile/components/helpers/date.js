const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfTheYear = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function zeroHMS(d) {
  d.setUTCHours(0);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  d.setUTCMilliseconds(0);
}

export function getDayOfTheWeek(isoDate) {
  return daysOfTheWeek[new Date(isoDate).getDay()];
}

export function getShortDayOfTheWeek(isoDate) {
  return getDayOfTheWeek(isoDate).substr(0, 3);
}

export function getShortMonth(isoDate) {
  const m = monthsOfTheYear[new Date(isoDate).getMonth()];
  return m.substr(0, 3);
}

export function dateWithOrdinal(d) {
  const day = d.getDate();
  const lastDigit = day.toString().substr(-1);
  let ordinal = 'th';
  if (day === 11 || day === 12 || day === 13) {
    ordinal = 'th';
  } else if (lastDigit === 1) {
    ordinal = 'st';
  } else if (lastDigit === '2') {
    ordinal = 'nd';
  } else if (lastDigit === '3') {
    ordinal = 'rd';
  }
  return `${day}${ordinal}`;
}

export function prettyDate(isoDate) {
  const d = new Date(isoDate);
  const day = daysOfTheWeek[d.getDay()];
  const month = monthsOfTheYear[d.getMonth()];
  return `${day}, ${dateWithOrdinal(d)} ${month}`;
}

export function shortPrettyDate(isoDate) {
  const d = new Date(isoDate);
  const day = getShortDayOfTheWeek(isoDate);
  const month = getShortMonth(isoDate);
  return `${day}, ${month} ${dateWithOrdinal(d)}`;
}

export function today() {
  let d = new Date();
  const offset = d.getTimezoneOffset();
  d = new Date(d.getTime() - (offset * 60 * 1000));
  zeroHMS(d);
  return d;
}

export function fromISOString(isoStr) {
  const res = new Date(isoStr);
  zeroHMS(res);
  return res;
}

export function addDays(d, days) {
  const result = new Date(d);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function daysBetween(firstDate, secondDate) {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

export function toShortISOString(d) {
  return d.toISOString().split('T')[0];
}

export function prettyMealSlot(slot, date) {
  const mealSlot = slot.substr(0, 1).toUpperCase() + slot.substr(1);
  return `${mealSlot} on ${prettyDate(date)}`;
}

export function shortPrettyMealSlot(slot, date) {
  const mealSlot = slot.substr(0, 1).toUpperCase() + slot.substr(1);
  return `${mealSlot} on ${getShortDayOfTheWeek(date)}`;
}


