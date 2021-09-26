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
    marginBottom: 20,
  },
  plannerGridContainer: {
    padding: 20,
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

const plannerGridItemRenderer = ({ onMealSelected }) => ({ item }) => {
  if (item.isHeader) {
    return <Text>{item.name}</Text>;
  }
  if (item.isLabel) {
    return <PlannerGridLabel dayOfTheWeek={item.name} />;
  }
  const onPress = () => onMealSelected(item);
  const onLongPress = () => console.log(`You long pressed ${item.id}`);
  return <PlannerGridMeaButton onPress={onPress} onLongPress={onLongPress} mealName={item.name} />;
};

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
  selectedWeek, onWeekSelected, gridData, onMealSelected,
}) => (
  <>
    <View style={styles.plannerGridContainer}>
      <FlatList
        data={gridData}
        renderItem={plannerGridItemRenderer({ onMealSelected })}
        keyExtractor={(item) => item.id}
        numColumns={3}
      />
    </View>
    <View style={styles.weekSelectorButtonContainer}>
      <WeekSelectorButton id="thisWeek" selectedWeek={selectedWeek} onPress={onWeekSelected} style={{ marginRight: 10 }} />
      <WeekSelectorButton id="nextWeek" selectedWeek={selectedWeek} onPress={onWeekSelected} />
    </View>
  </>
);
