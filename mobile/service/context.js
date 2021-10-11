import React from 'react';
import { Platform } from 'react-native';
import MealPlanApi from '../state/MealPlanApi';
import AppState from '../state/AppState';

const mealPlanApi = new MealPlanApi({
  apiRoot: 'https://script.google.com/a/macros/jonnyreeves.co.uk/s/AKfycbw0L6ysbPjm-J1jv5siRukYXG57MuLnGkGWQHbZnWrb/dev',
  useProxy: Platform.OS === 'web',
});
export const MealPlanApiCtx = React.createContext(mealPlanApi);

const appState = new AppState({
  api: mealPlanApi,
});
export const AppStateCtx = React.createContext(appState);
