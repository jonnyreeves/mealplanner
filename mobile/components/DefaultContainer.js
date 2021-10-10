import React, { useEffect } from 'react';
import { DefaultTheme, Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Plan from './Plan';
import Browse from './Browse';
import { MealPlanServiceCtx } from '../service/context';
import RecipeInfo from './RecipeInfo';
import ChooseRecipe from './ChooseRecipe';
import doAddRecipeToPlan from './AddRecipeToPlan';

const AppStack = createNativeStackNavigator();

const List = () => (
  <Text>Shopping List</Text>
);

const tabOpts = ({ icon }) => ({
  tabBarIcon: ({ focused }) => {
    const iconColor = focused ? 'white' : 'grey';
    return (<MaterialCommunityIcons name={icon} size={24} color={iconColor} />);
  },
});

const Tab = createMaterialBottomTabNavigator();
const HomeTabs = () => (
  <Tab.Navigator initialRoute="Plan" barStyle={{ backgroundColor: DefaultTheme.colors.primary }}>
    <Tab.Screen name="Plan" component={Plan} options={tabOpts({ icon: 'calendar' })} />
    <Tab.Screen name="Browse" component={Browse} options={tabOpts({ icon: 'silverware-fork-knife' })} />
    <Tab.Screen name="List" component={List} options={tabOpts({ icon: 'format-list-checkbox' })} />
  </Tab.Navigator>
);

export default function DefaultContainer() {
  const mealPlanService = React.useContext(MealPlanServiceCtx);

  // On mount, prefetch all API calls.
  useEffect(() => {
    mealPlanService.getPlan();
    mealPlanService.getRecipes();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppStack.Navigator>
          <AppStack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
          <AppStack.Screen name="RecipeInfo" component={RecipeInfo} options={{ headerTitle: 'Recipe Details' }} />
          <AppStack.Screen name="ChooseRecipe" component={ChooseRecipe} />
          <AppStack.Screen name="AddRecipeToPlan" component={doAddRecipeToPlan} options={{ headerTitle: 'Add Recipe to Plan' }} />
        </AppStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
