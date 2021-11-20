/* eslint-disable import/prefer-default-export */
import React, { Fragment, useState } from 'react';
import {
  StyleSheet, View, TouchableOpacity, FlatList,
} from 'react-native';
import { Text, Button, withTheme } from 'react-native-paper';
import { kebab } from '../helpers/kebab';
import { toPlannerGridData } from '../helpers/planData';
import { WeekSelector } from './WeekSelector';

const styles = StyleSheet.create({
  plannerGridContainer: {
  },
  planListLabel: {
    width: 40,
    justifyContent: 'center',
  },
  planListEntry: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 4,
    justifyContent: 'center',
    padding: 8,
  },
  planListEntrySwapSource: {
    flex: 1,
    height: 60,
    color: 'white',
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

export const PlannerGrid = withTheme(({ theme, swapSource, planData, onMealSelected }) => {
  const { colors } = theme;
  const [selectedWeek, setSelectedWeek] = useState('thisWeek');

  const PlannerGridMeaButton = ({ onPress, onLongPress, mealName }) => (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.planListEntry, { backgroundColor: colors.accent }]}>
      <Text style={{ textAlign: 'center' }}>{mealName}</Text>
    </TouchableOpacity>
  );

  const plannerGridItemRenderer = ({ item }) => {
    if (item.isHeader) {
      return <Text>{item.name}</Text>;
    }
    if (item.isLabel) {
      return <PlannerGridLabel dayOfTheWeek={item.name} />;
    }
    if (swapSource && swapSource.id === item.id) {
      return (
        <TouchableOpacity style={[styles.planListEntrySwapSource, { backgroundColor: colors.primary }]}>
          <Text style={{ textAlign: 'center' }}>{item.name}</Text>
        </TouchableOpacity>
      );
    }

    const onPress = () => onMealSelected(item);
    const onLongPress = () => console.log(`You long pressed ${item.id}: ${item.name}`);
    return <PlannerGridMeaButton onPress={onPress} onLongPress={onLongPress} mealName={item.name} />;
  };

  const gridData = toPlannerGridData(Object.values(planData))[selectedWeek];

  return (
    <>
      <View style={styles.plannerGridContainer}>
        <FlatList
          data={gridData}
          renderItem={plannerGridItemRenderer}
          keyExtractor={(item) => kebab(`${item.id}-${item.name}`)}
          numColumns={3}
          extraData={swapSource}
        />
      </View>
      <WeekSelector selectedWeek={selectedWeek} onSelect={(value) => setSelectedWeek(value)} />
    </>
  );
});
