import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppState, usePlanUpdatedListener } from './helpers/navigation';
import { PlannerGrid } from './widgets/PlannerGrid';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    padding: 12,
  },
  plannerGridContainer: {
    paddingHorizontal: 18,
    paddingTop: 40,
  },
});

export default function MovePlanEntry({ route }) {
  const { meal } = route.params;

  const appState = useAppState();
  const navigation = useNavigation();
  const [planData, setPlanData] = useState(null);
  const [swapSource, setSwapSource] = useState(meal);

  const refresh = () => setPlanData(appState.getPlanData());
  usePlanUpdatedListener(() => refresh());
  useEffect(() => refresh(), []);

  const onMealSelected = (target) => {
    const source = meal;
    appState.swapPlanEntries({
      src: { date: source.date, slot: source.slot, recipeName: source.name },
      dest: { date: target.date, slot: target.slot, recipeName: target.name },
    });
    setSwapSource({ date: target.date, slot: target.slot, recipeName: source.name });
    setTimeout(() => navigation.popToTop(), 1000);
  };

  const title = `Select a new slot for ${meal.name}`;
  const hasPlanData = planData && Object.keys(planData).length > 0;

  return (
    <View style={styles.viewContainer}>
      {hasPlanData && (
        <>
          <Text>{title}</Text>
          <View style={styles.plannerGridContainer}>
            <PlannerGrid
              onMealSelected={onMealSelected}
              planData={planData}
              swapSource={swapSource}
            />
          </View>
        </>
      )}
    </View>
  );
}
