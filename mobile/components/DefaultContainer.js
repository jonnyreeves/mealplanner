import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { DefaultTheme, Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Plan from './Plan';
import Browse from './Browse';
import { MealPlanApiCtx } from '../service/context';
import ViewRecipe from './ViewRecipe';
import EditRecipe from './EditRecipe';
import ChooseRecipe from './ChooseRecipe';
import doAddRecipeToPlan from './AddRecipeToPlan';
import { Routes } from '../constants';
import { Keyboard } from 'react-native';
import EditRecipeTags from './EditRecipeTags';
import EditRecipeIngredients from './EditRecipeIngredients';

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

export default function DefaultContainer() {
  const mealPlanApi = React.useContext(MealPlanApiCtx);

  // On mount, prefetch all API calls.
  useEffect(() => {
    mealPlanApi.fetchPlan();
    mealPlanApi.fetchRecipes();
  }, []);

  const Tab = createMaterialBottomTabNavigator();
  const HomeTabs = () => (
    <Tab.Navigator initialRoute="Plan" barStyle={{ backgroundColor: DefaultTheme.colors.primary }}>
      <Tab.Screen name="Plan" component={Plan} options={tabOpts({ icon: 'calendar' })} />
      <Tab.Screen name="Browse" component={Browse} options={tabOpts({ icon: 'silverware-fork-knife' })} />
      <Tab.Screen name="List" component={List} options={tabOpts({ icon: 'format-list-checkbox' })} />
    </Tab.Navigator>
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppStack.Navigator>
          <AppStack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
          <AppStack.Screen name={Routes.ViewRecipe} component={ViewRecipe} options={{ headerTitle: 'Recipe Details' }} />
          <AppStack.Screen name={Routes.EditRecipe} component={EditRecipe} options={{ headerTitle: 'Edit Recipe' }} />
          <AppStack.Screen name={Routes.EditRecipeTags} component={EditRecipeTags} options={{ headerTitle: 'Edit Recipe Tags' }} />
          <AppStack.Screen name={Routes.EditRecipeIngredients} component={EditRecipeIngredients} options={{ headerTitle: 'Add Ingredient' }} />
          <AppStack.Screen name="ChooseRecipe" component={ChooseRecipe} />
          <AppStack.Screen name="AddRecipeToPlan" component={doAddRecipeToPlan} options={{ headerTitle: 'Add Recipe to Plan' }} />
        </AppStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
