import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as GoogleAuthHelper from '../service/expoGooleAuthHelper';
import { MealPlanServiceCtx } from '../service/context';
import { LoadingSpinner } from './widgets/LoadingSpinner';

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
  const authConfig = {
    webClientId: '509061346774-n1jj6659echchulhkd9tl2t81hq0lb5q.apps.googleusercontent.com',
    androidClientId: '509061346774-psfmklgo6svn9eictqc60qumlh5m6bkj.apps.googleusercontent.com',
    androidStandaloneAppClientId: '509061346774-br2k8o3ipa5rateshvja7ic0h0m9abra.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive'],
  };

  const [needsSignIn, setNeedsSignIn] = React.useState(false);
  const [, refreshResponse, doRefresh] = GoogleAuthHelper.useGoogleTokenRefresh(authConfig);
  const [authRequest, authResponse, doAuthRequest] = GoogleAuthHelper.useGoogleSignIn(authConfig);

  const mealPlanService = React.useContext(MealPlanServiceCtx);

  // Handle refresh state changes.
  React.useEffect(() => {
    const type = refreshResponse?.type;
    if (!type) return;
    console.log(`effect => refreshResponse. type=${type}`);
    if (type === 'success') {
      const { accessToken } = refreshResponse.authentication;
      console.log(`effect => refreshResponse. accessToken=${accessToken}`);
      mealPlanService.setAccessToken(accessToken);
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
      mealPlanService.setAccessToken(accessToken);

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

  // On mount, try to fetch a cached refresh token from Secure Storage; this will either
  // complete in a succesul login flow, or fail and require us to prompt the user to sign in.
  React.useEffect(() => {
    console.log('effect => [mount]. Querying storage...');
    SecureStore.getItemAsync(SECURE_STORE_KEY)
      .then((rToken) => doRefresh(rToken))
      .catch(() => doRefresh(null));
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
      { !needsSignIn && <LoadingSpinner message="Authenticating" /> }
      { needsSignIn && <SignInOptions /> }
    </View>
  );
}
