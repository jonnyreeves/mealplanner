import { useNavigation } from '@react-navigation/core';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AppStateCtx } from '../service/context';
import { toPlannerGridData } from './helpers/planData';
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

export default function doAddRecipeToPlan({ route }) {
  const { recipe } = route.params;

  const appState = useContext(AppStateCtx);

  const navigation = useNavigation();
  const [planData, setPlanData] = useState(null);

  const refresh = () => {
    setPlanData(appState.getPlanData());
  };

  useEffect(() => {
    const unsub = appState.addListener('plan_updated', () => refresh());
    return () => unsub();
  }, []);

  useEffect(() => refresh(), []);

  const onMealSelected = (meal) => {
    appState.setPlanEntry({ date: meal.date, slot: meal.slot, recipeName: recipe.name });
    setTimeout(() => navigation.popToTop(), 750);
  };

  const title = `Select a slot for ${recipe.name}`;
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
            />
          </View>
        </>
      )}
    </View>
  );
}
