/* eslint-disable import/prefer-default-export */
import React, { useState } from 'react';
import {
  StyleSheet, View, TouchableOpacity, FlatList, RefreshControl, Dimensions
} from 'react-native';
import { Text, withTheme } from 'react-native-paper';
import { kebab } from '../helpers/kebab';
import { toPlannerGridData } from '../helpers/planData';
import { WeekSelector } from './buttons';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  plannerGridContainer: {
    width: width - 50,
    marginRight: 50,
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
    borderStyle: 'dotted',
    borderWidth: 4,
  },
  planListEntryText: {
    textAlign: 'center',
  },
});

const PlannerGridLabel = ({ dayOfTheWeek }) => (
  <View style={[styles.planListLabel]}>
    <Text>{dayOfTheWeek}</Text>
  </View>
);

export const PlannerGrid = withTheme(({
  theme, swapSource, plan, onMealSelected, refreshing, onRefresh,
}) => {
  const { colors } = theme;

  const PlannerGridMeaButton = ({
    onPress, onLongPress, mealName, additionalStyles = [],
  }) => (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={[styles.planListEntry, { backgroundColor: colors.accent }, ...additionalStyles]}>
      <Text numberOfLines={2} style={styles.planListEntryText}>{mealName}</Text>
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
      return <PlannerGridMeaButton mealName={item.name} additionalStyles={[styles.planListEntrySwapSource, { borderColor: colors.primary }]} />;
    }

    const onPress = () => onMealSelected(item);
    const onLongPress = () => console.log(`You long pressed ${item.id}: ${item.name}`);
    return <PlannerGridMeaButton onPress={onPress} onLongPress={onLongPress} mealName={item.name} />;
  };

  const gridData = toPlannerGridData(plan);

  return (
    <>
      <View style={styles.plannerGridContainer}>
        <FlatList
          data={gridData}
          renderItem={plannerGridItemRenderer}
          keyExtractor={(item) => kebab(`${item.id}-${item.name}`)}
          numColumns={3}
          extraData={swapSource}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    </>
  );
});
