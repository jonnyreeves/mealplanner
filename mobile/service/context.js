import React from 'react';
import { Platform } from 'react-native';
import MealPlanApi from './mealPlanService';

const api = new MealPlanApi({
  apiRoot: 'https://script.google.com/a/macros/jonnyreeves.co.uk/s/AKfycbw0L6ysbPjm-J1jv5siRukYXG57MuLnGkGWQHbZnWrb/dev',
  useProxy: Platform.OS === 'web',
});

export const MealPlanServiceCtx = React.createContext(api);
