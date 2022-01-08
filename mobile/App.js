import React, { useContext, useState } from 'react';
import { DefaultTheme, Provider as PaperProvider, Snackbar, Text } from 'react-native-paper';

import { DefaultContainer } from './components/DefaultContainer';
import GoogleLogin from './components/GoogleLogin';
import { AppStateCtx, MealPlanApiCtx } from './service/context';
import { theme } from './theme';
import { SpinnerServiceProvider } from './components/widgets/modals';

export default function App() {
  const [appInitialised, setAppInitalised] = useState(false);
  const [apiError, setApiError] = useState(null);

  const mealPlanApi = useContext(MealPlanApiCtx);
  const appState = useContext(AppStateCtx);

  mealPlanApi.addListener('api_error', (err) => setApiError(err));
  const apiErrMsg = `Api request failed: ${apiError?.message}`;

  return (
    <PaperProvider theme={theme}>
      <SpinnerServiceProvider>
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
      </SpinnerServiceProvider>
    </PaperProvider>
  );
}
