import React, { useContext, useState } from 'react';
import { Text, Provider as PaperProvider } from 'react-native-paper';

import DefaultContainer from './components/DefaultContainer';
import GoogleLogin from './components/GoogleLogin';
import { MealPlanApiContext } from './data/apiContext';


export default function App() {
  const [ appInitialised, setAppInitalised ] = useState(false);
  const mealPlanApi = useContext(MealPlanApiContext);

  return (
    <PaperProvider>
      <MealPlanApiContext.Provider value={mealPlanApi}>
          { !appInitialised &&  
            <GoogleLogin onAccessTokenSet={ () => { setAppInitalised(true) }} /> 
          }
          { appInitialised && <DefaultContainer /> }
      </MealPlanApiContext.Provider>
    </PaperProvider>
  );
}