import React, { useContext, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

import DefaultContainer from './components/DefaultContainer';
import GoogleLogin from './components/GoogleLogin';
import { MealPlanServiceCtx } from './service/context';

export default function App() {
  const [appInitialised, setAppInitalised] = useState(false);
  const mealPlanService = useContext(MealPlanServiceCtx);

  return (
    <PaperProvider>
      <MealPlanServiceCtx.Provider value={mealPlanService}>
        {!appInitialised
          && <GoogleLogin onAccessTokenSet={() => { setAppInitalised(true); }} />}
        {appInitialised && <DefaultContainer />}
      </MealPlanServiceCtx.Provider>
    </PaperProvider>
  );
}
