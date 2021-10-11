import React, { useContext, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

import DefaultContainer from './components/DefaultContainer';
import GoogleLogin from './components/GoogleLogin';
import { AppStateCtx, MealPlanApiCtx } from './service/context';

export default function App() {
  const [appInitialised, setAppInitalised] = useState(false);

  const mealPlanApi = useContext(MealPlanApiCtx);
  const appState = useContext(AppStateCtx);

  return (
    <PaperProvider>
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
