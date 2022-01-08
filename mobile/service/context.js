import { createContext, useContext } from 'react';
import { Platform } from 'react-native';
import MealPlanApi from '../state/MealPlanApi';
import AppState from '../state/AppState';
import LocalStorage from '../state/LocalStorage';
import SessionState from '../state/SessionState';

const mealPlanApi = new MealPlanApi({
  apiRoot: 'https://script.google.com/a/macros/jonnyreeves.co.uk/s/AKfycbw0L6ysbPjm-J1jv5siRukYXG57MuLnGkGWQHbZnWrb/dev',
  useProxy: Platform.OS === 'web',
});
export const MealPlanApiCtx = createContext(mealPlanApi);
export const SessionStateCtx = createContext(new SessionState());

const appState = new AppState({
  api: mealPlanApi,
  storage: new LocalStorage(),
});
appState.init();
export const AppStateCtx = createContext(appState);

export const useAppState = () => useContext(AppStateCtx);
export const useSessionState = () => useContext(SessionStateCtx);
export const useMealPlanApi = () => useContext(MealPlanApiCtx);
