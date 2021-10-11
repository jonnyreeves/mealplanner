import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { toPlannerGridData } from './helpers/planData';
import { usePlanApi } from './helpers/usePlanApi';
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
  const mealPlanApi = usePlanApi();

  const navigation = useNavigation();
  const [selectedWeek, setSelectedWeek] = useState('thisWeek');
  const [plannerGridData, setPlannerGridData] = useState(null);

  const refreshPlan = () => {
    mealPlanApi.getPlan()
      .then((response) => setPlannerGridData(toPlannerGridData(response)));
  };

  useEffect(() => refreshPlan(), []);

  const onMealSelected = (meal) => {
    mealPlanApi.setMeal({ date: meal.date, slot: meal.slot, recipeName: recipe.name });
    refreshPlan();
    setTimeout(() => navigation.popToTop(), 750);
  };

  const title = `Select a slot for ${recipe.name}`;

  return (
    <View style={styles.viewContainer}>
      {plannerGridData && (
        <>
          <Text>{title}</Text>
          <View style={styles.plannerGridContainer}>
            <PlannerGrid
              selectedWeek={selectedWeek}
              onWeekSelected={(week) => setSelectedWeek(week)}
              onMealSelected={onMealSelected}
              gridData={plannerGridData[selectedWeek]}
            />
          </View>
        </>
      )}
    </View>
  );
}
