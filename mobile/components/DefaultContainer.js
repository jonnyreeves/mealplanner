import React, { useEffect } from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Plan from './Plan';
import { MealPlanServiceCtx } from '../service/context';
import RecipeInfo from './RecipeInfo';

const PlanStack = createNativeStackNavigator();

const PlanRoute = () => (
  <PlanStack.Navigator screenOptions={{ headerShown: false }}>
    <PlanStack.Screen name="Plan" component={Plan} />
    <PlanStack.Screen name="RecipeInfo" component={RecipeInfo} />
  </PlanStack.Navigator>
);

const ListRoute = () => (
  <Text>Shopping List</Text>
);

export default function DefaultContainer() {
  const mealPlanService = React.useContext(MealPlanServiceCtx);

  // On mount, prefetch all API calls.
  useEffect(() => {
    mealPlanService.getPlan();
    mealPlanService.getRecipes();
  }, []);

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'plan', title: 'Plan', icon: 'calendar' },
    { key: 'list', title: 'Lists', icon: 'view-list' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    plan: PlanRoute,
    list: ListRoute,
  });

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
