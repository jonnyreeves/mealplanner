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
  const [selectedWeek, setSelectedWeek] = useState('thisWeek');
  const [planData, setPlanData] = useState([]);
  const [plannerGridData, setPlannerGridData] = useState(null);

  const refresh = () => {
    const entries = appState.getPlanEntries();
    setPlanData(entries);
    setPlannerGridData(toPlannerGridData(entries));
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

  return (
    <View style={styles.viewContainer}>
      {planData.length && (
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
