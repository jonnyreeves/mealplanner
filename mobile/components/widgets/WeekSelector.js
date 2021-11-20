import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  weekSelectorButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 20,
    marginBottom: 20,
  },
});

export const WeekSelector = ({ selectedWeek, onSelect, containerStyle }) => {
  const thisWeekOn = <Button mode="contained" style={{ marginRight: 10 }}>This Week</Button>;
  const thisWeekOff = <Button mode="outlined" style={{ marginRight: 10 }} onPress={() => onSelect('thisWeek')}>This Week</Button>;
  const nextWeekOn = <Button mode="contained">Next Week</Button>;
  const nextWeekOff = <Button mode="outlined" onPress={() => onSelect('nextWeek')}>Next Week</Button>;

  return (
    <View style={[styles.weekSelectorButtonContainer, containerStyle]}>
      {selectedWeek === 'thisWeek'
        && (
          <>
            {thisWeekOn}
            {nextWeekOff}
          </>
        )}
      {selectedWeek === 'nextWeek'
        && (
          <>
            {thisWeekOff}
            {nextWeekOn}
          </>
        )}
    </View>
  );
};
