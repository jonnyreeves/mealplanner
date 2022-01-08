import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as GoogleAuthHelper from '../service/expoGooleAuthHelper';
import { MealPlanApiCtx } from '../service/context';
import { LoadingSpinner } from './widgets/modals';
import { authConfig, hasRefreshToken } from '../state/auth';

const SECURE_STORE_KEY = 'rt_v1';

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

GoogleAuthHelper.maybeCompleteAuthSession();

export default function GoogleLogin({ onAccessTokenSet }) {
  const [needsSignIn, setNeedsSignIn] = React.useState(false);
  const [, refreshResponse, doRefresh] = GoogleAuthHelper.useGoogleTokenRefresh();
  const [authRequest, authResponse, doAuthRequest] = GoogleAuthHelper.useGoogleSignIn(authConfig);

  const mealPlanApi = React.useContext(MealPlanApiCtx);

  // Handle refresh state changes.
  React.useEffect(() => {
    const type = refreshResponse?.type;
    if (!type) return;
    console.log(`effect => refreshResponse. type=${type}`);
    if (type === 'success') {
      const { accessToken } = refreshResponse.authentication;
      mealPlanApi.setAccessToken(accessToken);
      onAccessTokenSet();
    } else {
      setNeedsSignIn(true);
    }
  }, [refreshResponse]);

  // Handle authentication state changes.
  React.useEffect(() => {
    const type = authResponse?.type;
    console.log(`effect => authResponse. type=${type}`);
    if (type === 'success') {
      const { accessToken, refreshToken } = authResponse.authentication;

      mealPlanApi.setAccessToken(accessToken);

      // If we have a refresh token in the response, persist it to keep
      // the user signed in.
      if (refreshToken) {
        SecureStore.setItemAsync(SECURE_STORE_KEY, refreshToken)
          .then(() => console.log('Refresh token persisted to secure storage'))
          .catch((err) => console.warn(`Failed to persist refresh token to secure storage: ${err}`))
          .finally(() => onAccessTokenSet());
      } else {
        onAccessTokenSet();
      }
    }
  }, [authResponse]);

  React.useEffect(() => {
    (async () => {
      if (await hasRefreshToken()) { doRefresh(); } else { setNeedsSignIn(true); }
    })();
  }, []);

  const SignInOptions = () => (
    <>
      <Button mode="contained" icon="google" disabled={!authRequest} onPress={() => doAuthRequest()}>
        Sign in with Google
      </Button>
    </>
  );

  return (
    <View style={styles.viewContainer}>
      {!needsSignIn && <LoadingSpinner delay={500} message="Authenticating" />}
      {needsSignIn && <SignInOptions />}
    </View>
  );
}
