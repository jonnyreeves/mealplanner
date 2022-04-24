/* eslint-disable import/prefer-default-export */
import React, { useMemo, useState } from 'react';
import {
  StyleSheet, View, TouchableOpacity, FlatList, Dimensions
} from 'react-native';
import { Text } from 'react-native-paper';
import { toPlannerGridData } from '../helpers/planData';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');
const { colors } = theme;

const styles = StyleSheet.create({
  plannerGridContainer: {
    width: width - 30,
    marginHorizontal: 15,
  },
  planListLabel: {
    width: 44,
    height: 44,
    marginTop: 20,
    justifyContent: 'center',
    borderRadius: 22,
  },
  planListLabelTitle: {
    textAlign: 'center',
    lineHeight: 14,
  },
  planListLabelSubtitle: {
    fontSize: 9,
    lineHeight: 9,
    textAlign: 'center',
    color: 'grey',
  },
  planListEntry: {
    width: ((width - 30) / 2) - 30,
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

export const PlannerGrid = ({
  swapSource, plan, onMealSelected,
}) => {
  const gridData = toPlannerGridData(plan);

  const PlannerGridLabel = ({ title, subtitle, highlighted }) => {
    //fbf8cc
    //d674cc
    const highlightStyle = highlighted ? { backgroundColor: '#e5d9f2' } : {};
    return (
      <View style={[styles.planListLabel, highlightStyle]}>
        <Text style={[styles.planListLabelTitle]}>{title}</Text>
        <Text style={[styles.planListLabelSubtitle]}>{subtitle}</Text>
      </View>
    );
  };

  const PlannerGridMeaButton = ({
    onPress, mealName, additionalStyles = [],
  }) => (
    <TouchableOpacity onPress={onPress} style={[styles.planListEntry, { backgroundColor: colors.accent }, ...additionalStyles]}>
      <Text numberOfLines={2} style={styles.planListEntryText}>{mealName}</Text>
    </TouchableOpacity>
  );

  const plannerGridItemRenderer = ({ item }) => {
    if (item.isHeader) {
      return <Text>{item.name}</Text>;
    }
    if (item.isLabel) {
      return <PlannerGridLabel title={item.dayOfWeek} subtitle={item.shortDate} highlighted={item.isToday} />;
    }
    if (swapSource && swapSource.id === item.id) {
      return <PlannerGridMeaButton mealName={item.name} additionalStyles={[styles.planListEntrySwapSource, { borderColor: colors.primary }]} />;
    }

    const onPress = () => onMealSelected(item);
    return <PlannerGridMeaButton onPress={onPress} mealName={item.name} />;
  };

  return (
    <FlatList
      style={styles.plannerGridContainer}
      data={gridData}
      renderItem={plannerGridItemRenderer}
      keyExtractor={(item) => `planner-grid-${item.id}`}
      numColumns={3}
      extraData={swapSource}
    />

  );
};
