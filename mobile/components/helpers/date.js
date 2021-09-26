const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfTheYear = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function getDayOfTheWeek(isoDate) {
  return daysOfTheWeek[new Date(isoDate).getDay()];
}

export function getShortDayOfTheWeek(isoDate) {
  return getDayOfTheWeek(isoDate).substr(0, 3);
}

function dateWithOrdinal(d) {
  const day = d.getDate();
  const lastDigit = day.toString().substr(-1);
  let ordinal = 'th';
  if (day === 11 || day === 12 || day === 13) {
    ordinal = 'th';
  }
  if (lastDigit === 1) {
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

export function today() {
  let d = new Date();
  const offset = d.getTimezoneOffset();
  d = new Date(d.getTime() - (offset * 60 * 1000));
  zeroHMS(d);
  return d;
}

export function toShortISOString(d) {
  return d.toISOString().split('T')[0];
}

function zeroHMS(d) {
  d.setUTCHours(0);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  d.setUTCMilliseconds(0);
}
