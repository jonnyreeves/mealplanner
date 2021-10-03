import React, { useEffect } from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './Home';
import Plan from './Plan';
import MealInfo from './MealInfo';
import { MealPlanServiceCtx } from '../service/context';

const HomeStack = createNativeStackNavigator();

const HomeRoute = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={Home} />
    <HomeStack.Screen name="MealInfo" component={MealInfo} />
  </HomeStack.Navigator>
);
const PlanRoute = () => (
  <Plan />
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
