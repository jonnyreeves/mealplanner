import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';

import { kebab } from '../helpers/kebab';

const styles = StyleSheet.create({
  chipListContainer: {
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipListItem: {
    margin: 3,
    minHeight: 34,
  },
});

export const ChipList = ({
  containerStyle, chipStyle, chipTextStyle, items, onClose, onPress, selectedItems = [],
}) => {
  const chips = items.map((item) => (
    <Chip
      style={[styles.chipListItem, chipStyle]}
      textStyle={chipTextStyle}
      mode="outlined"
      selected={selectedItems.includes(item)}
      onClose={typeof onClose === 'function' ? (() => onClose(item)) : null}
      onPress={typeof onPress === 'function' ? (() => onPress(item)) : null}
      key={kebab(item)}
    >
      {item}
    </Chip>
  ));
  return (
    <View style={[styles.chipListContainer, containerStyle]}>
      {chips}
    </View>
  );
};
