import React, { useContext, useState } from 'react';
import { DefaultTheme, Provider as PaperProvider, Snackbar, Text } from 'react-native-paper';

import { DefaultContainer } from './components/DefaultContainer';
import GoogleLogin from './components/GoogleLogin';
import { AppStateCtx, MealPlanApiCtx } from './service/context';

export default function App() {
  const [appInitialised, setAppInitalised] = useState(false);
  const [apiError, setApiError] = useState(null);

  const mealPlanApi = useContext(MealPlanApiCtx);
  const appState = useContext(AppStateCtx);

  mealPlanApi.addListener('api_error', (err) => setApiError(err));
  const apiErrMsg = `Api request failed: ${apiError?.message}`;

  const theme = {
    ...DefaultTheme,
    roundness: 24,
    colors: {
      ...DefaultTheme.colors,
      primary: '#606c38',
      // background: '#000000',
      // surface: '#fefae0',
      accent: '#d8e2dc',
      // error: '',
      // text: '',
      // onSurface: '',
      // disabled: '',
      // placeholder: '',
      // backdrop: '#fefae0',
      // notification: '',
    },
  };

  return (
    <PaperProvider theme={theme}>
      <MealPlanApiCtx.Provider value={mealPlanApi}>
        <AppStateCtx.Provider value={appState}>
          {!appInitialised
            && <GoogleLogin onAccessTokenSet={() => { setAppInitalised(true); }} />}
          {appInitialised && <DefaultContainer />}
          <Snackbar
            visible={apiError !== null}
            onDismiss={() => setApiError(null)}
            wrapperStyle={{ paddingBottom: 55 }}
          >
            {apiErrMsg}
          </Snackbar>
        </AppStateCtx.Provider>
      </MealPlanApiCtx.Provider>
    </PaperProvider>
  );
}
