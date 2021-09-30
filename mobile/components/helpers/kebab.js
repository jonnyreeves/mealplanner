const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g;

export function kebab(str) {
  return str.replace(KEBAB_REGEX, (match) => `-${match.toLowerCase()}`);
}
