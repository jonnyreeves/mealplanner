import React, { useEffect } from 'react';
import { withTheme } from 'react-native-paper';
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
import CreateNewPlan from './CreateNewPlan';
import AddRecipeToPlan from './AddRecipeToPlan';
import { Routes } from '../constants';
import EditRecipeTags from './EditRecipeTags';
import EditRecipeIngredients from './EditRecipeIngredients';
import CreateRecipe from './CreateRecipe';
import List from './List';
import ModifyPlan from './ModifyPlan';

const AppStack = createNativeStackNavigator();

const tabOpts = ({ tabBarLabel, icon }) => ({
  tabBarLabel,
  tabBarIcon: ({ focused }) => {
    const iconColor = focused ? 'white' : '#283618';
    return (<MaterialCommunityIcons name={icon} size={24} color={iconColor} />);
  },
});

export const DefaultContainer = withTheme(({ theme }) => {
  const { colors } = theme;
  const mealPlanApi = React.useContext(MealPlanApiCtx);

  // On mount, prefetch all API calls.
  useEffect(() => {
    mealPlanApi.fetchPlan();
    mealPlanApi.fetchRecipes();
    mealPlanApi.fetchLists();
  }, []);

  const Tab = createMaterialBottomTabNavigator();
  const HomeTabs = () => (
    <Tab.Navigator initialRoute="Plan" inactiveColor="#ccd5ae" barStyle={{ backgroundColor: colors.primary }}>
      <Tab.Screen name="Plan" component={Plan} options={tabOpts({ icon: 'calendar' })} />
      <Tab.Screen name={Routes.Browse} component={Browse} options={tabOpts({ tabBarLabel: 'Meals', icon: 'silverware-fork-knife' })} />
      <Tab.Screen name="List" component={List} options={tabOpts({ tabBarLabel: 'Shop', icon: 'cart' })} />
    </Tab.Navigator>
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppStack.Navigator>
          <AppStack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
          <AppStack.Screen name={Routes.ViewRecipe} component={ViewRecipe} options={{ headerShown: false }} />
          <AppStack.Screen name={Routes.EditRecipe} component={EditRecipe} options={{ headerTitle: 'Edit Recipe' }} />
          <AppStack.Screen
            name={Routes.CreateRecipe}
            component={CreateRecipe}
            options={{
              headerLeft: () => (<></>),
              headerTitle: 'Create Recipe',
            }}
          />
          <AppStack.Screen name={Routes.EditRecipeTags} component={EditRecipeTags} options={{ headerTitle: 'Edit Recipe Tags' }} />
          <AppStack.Screen name={Routes.EditRecipeIngredients} component={EditRecipeIngredients} options={{ headerTitle: 'Add Recipe Ingredient' }} />
          <AppStack.Screen name="ChooseRecipe" component={ChooseRecipe} />
          <AppStack.Screen name="AddRecipeToPlan" component={AddRecipeToPlan} options={{ headerTitle: 'Add Recipe to Plan' }} />
          <AppStack.Screen name={Routes.CreateNewPlan} component={CreateNewPlan} options={{ headerTitle: 'Create new Plan' }} />
          <AppStack.Screen name={Routes.ModifyPlan} component={ModifyPlan} options={{ headerTitle: 'Modify Plan' }} />
        </AppStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
});
