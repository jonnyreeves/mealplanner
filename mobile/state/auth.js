import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants, { AppOwnership } from 'expo-constants';
import * as AppAuth from 'expo-app-auth';

export const authConfig = {
  webClientId: '509061346774-n1jj6659echchulhkd9tl2t81hq0lb5q.apps.googleusercontent.com',
  androidClientId: '509061346774-psfmklgo6svn9eictqc60qumlh5m6bkj.apps.googleusercontent.com',
  androidStandaloneAppClientId: '509061346774-br2k8o3ipa5rateshvja7ic0h0m9abra.apps.googleusercontent.com',
  scopes: ['https://www.googleapis.com/auth/drive'],
};

const SECURE_STORE_KEY = 'rt_v1';

function getRefreshClientId() {
  const isStandalone = Constants.appOwnership === AppOwnership.Standalone;
  const { androidStandaloneAppClientId, androidClientId } = authConfig;
  if (Platform.OS === 'android') {
    return (isStandalone) ? androidStandaloneAppClientId : androidClientId;
  }
  console.warn(`Could not determine refresh clientId for platform: ${Platform.OS}`);
  return '';
}

async function readRefreshToken() {
  return SecureStore.getItemAsync(SECURE_STORE_KEY);
}

export async function hasRefreshToken() {
  try {
    return (await readRefreshToken()).length > 0;
  } catch {
    return false;
  }
}

export async function doRefresh() {
  const refreshToken = await readRefreshToken();
  const config = {
    issuer: 'https://accounts.google.com',
    clientId: getRefreshClientId(),
    scopes: authConfig.scopes,
  };
  return AppAuth.refreshAsync(config, refreshToken);
}

