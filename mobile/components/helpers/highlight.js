import React from 'react';
import { Text } from 'react-native';

export const Highlight = ({ source, target, children, highlightStyle }) => {
  const defaultHighlight = (s) => <Text style={{ fontWeight: 'bold', ...highlightStyle }}>{s}</Text>;

  const escapeRegex = (v) => v.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');

  const highlightWord = (source, target, callback) => {
    const res = [];

    if (!source) return res;
    if (!target) return source;

    const regex = new RegExp(escapeRegex(target), 'gi');

    let lastOffset = 0;

    // Uses replace callback, but not its return value
    source.replace(regex, (val, offset) => {
      // Push both the last part of the string, and the new part with the highlight
      res.push(
        source.substr(lastOffset, offset - lastOffset),
        // Replace the string with JSX or anything.
        (callback || defaultHighlight)(val),
      );
      lastOffset = offset + val.length;
    });

    // Push the last non-highlighted string
    res.push(source.substr(lastOffset));
    return res;
  };
  return highlightWord(source, target, children);
}
