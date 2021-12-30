import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  buttonGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 20,
    marginBottom: 20,
  },
});

export const ToggleButtonGroup = ({
  children, selectedValue, onPress, containerStyle,
}) => {
  const selectedBtns = children.map(({ props: { label } }, idx) => (
    <Button key={`btn-${label}-selected`} mode="contained" style={{ marginLeft: (idx > 0) ? 10 : 0 }}>{label}</Button>
  ));
  const unselectedBtns = children.map(({ props: { label, value } }, idx) => (
    <Button key={`btn-${label}-unselected`} mode="outlined" style={{ marginLeft: (idx > 0) ? 10 : 0 }} onPress={() => onPress(value)}>{label}</Button>
  ));

  const selectedIdx = children.findIndex((child) => child.props.value === selectedValue);
  const toRender = [
    ...unselectedBtns.slice(0, selectedIdx),
    selectedBtns[selectedIdx],
    ...unselectedBtns.slice(selectedIdx + 1),
  ];

  return (
    <View style={[styles.buttonGroupContainer, containerStyle]}>
      {toRender}
    </View>
  );
};

// eslint-disable-next-line no-unused-vars
ToggleButtonGroup.Btn = ({ label, value }) => null;

export const WeekSelector = ({ selectedWeek, onSelect, containerStyle }) => (
  <ToggleButtonGroup selectedValue={selectedWeek} onPress={onSelect} containerStyle={containerStyle}>
    <ToggleButtonGroup.Btn label="This Week" value="thisWeek" />
    <ToggleButtonGroup.Btn label="Next Week" value="nextWeek" />
  </ToggleButtonGroup>
);
