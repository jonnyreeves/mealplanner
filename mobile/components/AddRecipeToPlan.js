import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppState } from '../service/context';
import { usePlanUpdatedListener } from './helpers/navigation';
import { PlannerGrid } from './widgets/PlannerGrid';
import { PlanSelector } from './widgets/PlanSelector';

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

  const appState = useAppState();
  const navigation = useNavigation();

  const [planData, setPlanData] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const refresh = () => setPlanData(appState.getPlanData());

  usePlanUpdatedListener(() => refresh());
  useEffect(() => refresh(), []);

  useEffect(() => {
    if (!selectedPlanId && planData && Object.keys(planData).length > 0) {
      // TODO: Need to select the first active plan.
      setSelectedPlanId(Object.values(planData)[0].planId);
    }
  }, [planData]);

  const onMealSelected = (meal) => {
    appState.setPlanEntry({ date: meal.date, planId: meal.planId, slot: meal.slot, recipeName: recipe.name });
    setTimeout(() => navigation.popToTop(), 750);
  };

  const title = `Select a slot for ${recipe.name}`;
  const hasPlanSelected = Boolean(selectedPlanId);

  return (
    <View style={styles.viewContainer}>
      {hasPlanSelected && (
        <>
          <Text>{title}</Text>
          <PlanSelector planData={planData} selectedPlanId={selectedPlanId} setSelectedPlanId={setSelectedPlanId} />
          <View style={styles.plannerGridContainer}>
            <PlannerGrid
              onMealSelected={onMealSelected}
              plan={planData[selectedPlanId]}
            />
          </View>
        </>
      )}
    </View>
  );
}
