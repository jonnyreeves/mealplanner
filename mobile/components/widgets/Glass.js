import React from 'react';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  glass: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    opacity: 0.8,
  },
});

export function Glass({ visible }) {
  return (
    <>
      {visible && <View style={styles.glass} />}
      {!visible && <></>}
    </>
  );
};