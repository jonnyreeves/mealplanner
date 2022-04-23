import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppState } from '../service/context';
import { usePlanUpdatedListener } from './helpers/navigation';
import { usePlanSelector } from './helpers/planData';
import { PlanCarousel } from './widgets/PlanCarousel';
import { PlannerGrid } from './widgets/PlannerGrid';
import { PlanSelector } from './widgets/PlanSelector';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  plannerGridContainer: {
    paddingHorizontal: 18,
    paddingTop: 40,
  },
  titleContainer: {
    padding: 8,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C0C0C0',

    backgroundColor: 'white',
  },
  titleText: {
    textAlign: 'center',
    fontSize: 16,
  }
});

export default function doAddRecipeToPlan({ route }) {
  const { recipe } = route.params;

  const appState = useAppState();
  const navigation = useNavigation();
  const [planData, setPlanData] = useState(null);

  const refresh = () => setPlanData(appState.getPlanData());

  usePlanUpdatedListener(() => refresh());
  useEffect(() => refresh(), []);

  const onMealSelected = (meal) => {
    appState.setPlanEntry({ date: meal.date, planId: meal.planId, slot: meal.slot, recipeName: recipe.name });
    setTimeout(() => navigation.popToTop(), 750);
  };

  const title = `Pick a slot for ${recipe.name}`;
  const hasPlanSelected = Boolean(planData);

  return (
    <View style={styles.viewContainer}>
      {hasPlanSelected && (
        <>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
          <PlanCarousel
            readonly
            planData={planData}
            onMealSelected={onMealSelected}
          />
        </>
      )}
    </View>
  );
}
