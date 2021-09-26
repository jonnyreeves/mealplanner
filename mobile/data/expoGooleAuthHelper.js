import * as React from 'react';
import * as GoogleWebAuth from 'expo-auth-session/providers/google';
import * as GoogleAppAuth from 'expo-google-app-auth';
import * as WebBrowser from 'expo-web-browser';
import * as AppAuth from 'expo-app-auth';
import { Platform } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';

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
    GoogleAppAuth.logInAsync(authConfig)
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
export function useGoogleTokenRefresh(authConfig) {
  const [refreshRequest, setRefreshRequest] = React.useState(true);
  const [refreshResult, setRefreshResult] = React.useState(null);
  const refreshAsync = React.useCallback((refreshToken) => {
    if (!refreshToken) {
      return setRefreshResult({
        type: 'cancelled',
      });
    }
    setRefreshRequest(false);

    const clientId = getRefreshClientId(authConfig);
    const config = {
      issuer: 'https://accounts.google.com',
      clientId,
      scopes: authConfig.scopes,
    };
    AppAuth.refreshAsync(config, refreshToken)
      .then((res) => {
        setRefreshResult({
          type: 'success',
          authentication: res,
        });
      })
      .catch((err) => {
        setRefreshResult({
          type: 'failed',
        });
      })
      .finally(() => setRefreshRequest(true));
  }, [authConfig?.expoClientId]);

  return [refreshRequest, refreshResult, refreshAsync];
}

function getRefreshClientId(authConfig) {
  const isStandalone = Constants.appOwnership === AppOwnership.Standalone;
  const { androidStandaloneAppClientId, androidClientId } = authConfig;
  if (Platform.OS === 'android') {
    return (isStandalone) ? androidStandaloneAppClientId : androidClientId;
  }
  console.warn(`Could not determine refresh clientId for platform: ${Platform.OS}`);
  return '';
}
