import * as React from 'react';
import * as GoogleWebAuth from 'expo-auth-session/providers/google';
import * as GoogleAppAuth from 'expo-google-app-auth';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { doRefresh } from '../state/auth';

// Call this function once in your Component which handles the Google authentication
// flow; typically done outside of the component decleration (ie: just after your
// import statements).
// Refer to the code example here: https://docs.expo.dev/guides/authentication/#google
export function maybeCompleteAuthSession() {
  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }
}

// Initialises the state required to perform a Google Authentication request
// (authRequest, and authResult) and returns a func which will initiate the request
// across both Android and Web (promptAsync).
// Refer to the code example here: https://docs.expo.dev/guides/authentication/#google
export function useGoogleSignIn(authConfig) {
  if (Platform.OS === 'web') {
    const [authRequet, authResult, promptAsync] = GoogleWebAuth.useAuthRequest({
      webClientId: authConfig.webClientId,
      scopes: authConfig.scopes,
    });
    return [authRequet, authResult, promptAsync];
  }
  const [authRequest, setAuthRequest] = React.useState(true);
  const [authResult, setAuthResult] = React.useState(null);
  const promptAsync = () => {
    setAuthRequest(false);
    return GoogleAppAuth.logInAsync(authConfig)
      .then((authObject) => {
        setAuthRequest(true);
        const type = authObject?.type;
        if (type === 'cancel') {
          setAuthResult({ type });
        } else if (type === 'success') {
          setAuthResult({
            type,
            authentication: authObject,
          });
        } else {
          setAuthResult(null);
        }
      });
  };
  return [authRequest, authResult, promptAsync];
}

// Initialises the state required to perform a Google Refresh Token exchange
// (refreshRequest and refreshResult), and returns a func which will perform the
// refresh token exchange (refreshAsync).
export function useGoogleTokenRefresh() {
  const [refreshRequest, setRefreshRequest] = React.useState(true);
  const [refreshResult, setRefreshResult] = React.useState(null);
  const refreshAsync = (refreshToken) => {
    if (!refreshToken) {
      return setRefreshResult({
        type: 'cancelled',
      });
    }
    setRefreshRequest(false);

    return doRefresh()
      .then((res) => {
        setRefreshResult({
          type: 'success',
          authentication: res,
        });
      })
      .catch(() => {
        setRefreshResult({
          type: 'failed',
        });
      })
      .finally(() => setRefreshRequest(true));
  };

  return [refreshRequest, refreshResult, refreshAsync];
}
