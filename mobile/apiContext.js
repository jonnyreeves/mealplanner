import React from 'react';
import { MealPlanApi } from './MealPlanApi';
import { Platform } from 'react-native';

const api = new MealPlanApi({
    apiRoot: "https://script.google.com/a/macros/jonnyreeves.co.uk/s/AKfycbw0L6ysbPjm-J1jv5siRukYXG57MuLnGkGWQHbZnWrb/dev",
    useProxy: Platform.OS == 'web',
  })

export const MealPlanApiContext = React.createContext(api);