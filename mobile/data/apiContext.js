import React from 'react';
import { Platform } from 'react-native';
import MealPlanApi from './MealPlanApi';

const api = new MealPlanApi({
  apiRoot: 'https://script.google.com/a/macros/jonnyreeves.co.uk/s/AKfycbw0L6ysbPjm-J1jv5siRukYXG57MuLnGkGWQHbZnWrb/dev',
  useProxy: Platform.OS === 'web',
});

const MealPlanApiContext = React.createContext(api);

export default MealPlanApiContext;
