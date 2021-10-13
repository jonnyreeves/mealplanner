import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';

import { kebab } from './kebab';

const styles = StyleSheet.create({
  chipListContainer: {
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipListItem: {
    margin: 3,
  },
});

export const ChipList = ({ containerStyle, items, onClose, onAdd, onPress, selectedItems = [] }) => {
  const chips = items.map((item) => (
    <Chip
      style={styles.chipListItem}
      mode="outlined"
      selected={selectedItems.includes(item)}
      onClose={typeof onClose === 'function' ? (() => onClose(item)) : null}
      onPress={typeof onPress === 'function' ? (() => onPress(item)) : null}
      key={kebab(item)}
    >
      {item}
    </Chip>
  ));
  if (typeof onAdd === 'function') {
    chips.push(<Chip style={styles.chipListItem} onPress={onAdd} icon="plus" mode="outlined" key="add">Add</Chip>);
  }
  return <View style={[styles.chipListContainer, containerStyle]}>{chips}</View>;
};
