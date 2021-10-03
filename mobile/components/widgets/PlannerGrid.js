/* eslint-disable import/prefer-default-export */
import React, { Fragment } from 'react';
import {
  StyleSheet, View, TouchableOpacity, FlatList,
} from 'react-native';
import { Text, Button, DefaultTheme } from 'react-native-paper';

const styles = StyleSheet.create({
  weekSelectorButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 20,
    marginBottom: 20,
  },
  plannerGridContainer: {
  },
  planListLabel: {
    width: 40,
    justifyContent: 'center',
  },
  planListEntry: {
    flex: 1,
    height: 60,
    backgroundColor: DefaultTheme.colors.accent,
    marginVertical: 4,
    marginHorizontal: 4,
    justifyContent: 'center',
    padding: 8,
  },
  planListEntrySwapSource: {
    flex: 1,
    height: 60,
    color: 'white',
    backgroundColor: DefaultTheme.colors.primary,
    marginVertical: 4,
    marginHorizontal: 4,
    justifyContent: 'center',
    padding: 8,
  },
});

const PlannerGridLabel = ({ dayOfTheWeek }) => (
  <View style={[styles.planListLabel]}>
    <Text>{dayOfTheWeek}</Text>
  </View>
);

const PlannerGridMeaButton = ({ onPress, onLongPress, mealName }) => (
  <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.planListEntry]}>
    <Text style={{ textAlign: 'center' }}>{mealName}</Text>
  </TouchableOpacity>
);

const WeekSelectorButton = ({
  id, selectedWeek, style, onPress,
}) => {
  const label = (id === 'thisWeek') ? 'This Week' : 'Next Week';
  const mode = (id === selectedWeek) ? 'contained' : 'outlined';
  return (
    <Button mode={mode} style={style} onPress={() => onPress(id)}>
      {label}
    </Button>
  );
};

export const PlannerGrid = ({
  selectedWeek, swapSource, onWeekSelected, gridData, onMealSelected,
}) => {
  const plannerGridItemRenderer = ({ item }) => {
    if (item.isHeader) {
      return <Text>{item.name}</Text>;
    }
    if (item.isLabel) {
      return <PlannerGridLabel dayOfTheWeek={item.name} />;
    }
    if (swapSource && swapSource.id === item.id) {
      return (
        <TouchableOpacity style={styles.planListEntrySwapSource}>
          <Text style={{ textAlign: 'center' }}>{item.name}</Text>
        </TouchableOpacity>
      );
    }

    const onPress = () => onMealSelected(item);
    const onLongPress = () => console.log(`You long pressed ${item.id}`);
    return <PlannerGridMeaButton onPress={onPress} onLongPress={onLongPress} mealName={item.name} />;
  };

  return (
    <>
      <View style={styles.plannerGridContainer}>
        <FlatList
          data={gridData}
          renderItem={plannerGridItemRenderer}
          keyExtractor={(item) => item.id}
          numColumns={3}
          extraData={swapSource}
        />
      </View>
      <View style={styles.weekSelectorButtonContainer}>
        <WeekSelectorButton id="thisWeek" selectedWeek={selectedWeek} onPress={onWeekSelected} style={{ marginRight: 10 }} />
        <WeekSelectorButton id="nextWeek" selectedWeek={selectedWeek} onPress={onWeekSelected} />
      </View>
    </>
  )

};
