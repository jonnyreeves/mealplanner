import React, { useContext, useState } from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import DefaultContainer from './components/DefaultContainer';
import GoogleLogin from './components/GoogleLogin';
import { AppStateCtx, MealPlanApiCtx } from './service/context';

export default function App() {
  const [appInitialised, setAppInitalised] = useState(false);

  const mealPlanApi = useContext(MealPlanApiCtx);
  const appState = useContext(AppStateCtx);

  const theme = {
    ...DefaultTheme,
    roundness: 24,
    colors: {
      ...DefaultTheme.colors,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <MealPlanApiCtx.Provider value={mealPlanApi}>
        <AppStateCtx.Provider value={appState}>
          {!appInitialised
            && <GoogleLogin onAccessTokenSet={() => { setAppInitalised(true); }} />}
          {appInitialised && <DefaultContainer />}
        </AppStateCtx.Provider>
      </MealPlanApiCtx.Provider>
    </PaperProvider>
  );
}
