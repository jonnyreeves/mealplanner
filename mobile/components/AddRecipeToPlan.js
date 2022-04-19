import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import SideSwipe from 'react-native-sideswipe/src/carousel';
import { useAppState } from '../service/context';
import { usePlanUpdatedListener } from './helpers/navigation';
import { usePlanSelector } from './helpers/planData';
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
});

export default function doAddRecipeToPlan({ route }) {
  const { recipe } = route.params;

  const appState = useAppState();
  const navigation = useNavigation();

  const [planData, setPlanData] = useState(null);
  const {
    selectedPlanId,
    setSelectedPlanId,
    carouselIndex,
    setCarouselIndex,
  } = usePlanSelector();

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

  const { width } = Dimensions.get('window');
  const title = `Select a slot for ${recipe.name}`;
  const hasPlanSelected = Boolean(selectedPlanId);

  return (
    <View style={styles.viewContainer}>
      {hasPlanSelected && (
        <>
          <Text>{title}</Text>
          <View style={{ margin: 20 }}>
            <PlanSelector planData={planData} selectedPlanId={selectedPlanId} setSelectedPlanId={setSelectedPlanId} />
          </View>

          <SideSwipe
            data={Object.values(planData)}
            itemWidth={width}
            contentOffset={15}
            threshold={100}
            useVelocityForIndex={false}
            index={carouselIndex}
            onIndexChange={setCarouselIndex}
            renderItem={({ item }) => (
              <PlannerGrid
                onMealSelected={onMealSelected}
                plan={item}
              />
            )}
          />
        </>
      )}
    </View>
  );
}
