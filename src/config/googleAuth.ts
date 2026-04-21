import { Platform } from 'react-native';

const genericClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim();
const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID?.trim();
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || genericClientId;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || genericClientId;
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || genericClientId;

export const googleAuthRequestConfig = {
  expoClientId,
  iosClientId,
  androidClientId,
  webClientId,
  scopes: ['openid', 'profile', 'email'],
  selectAccount: true,
};

export const googleAuthReady =
  Platform.OS === 'android'
    ? Boolean(androidClientId || expoClientId)
    : Platform.OS === 'ios'
      ? Boolean(iosClientId || expoClientId)
      : Boolean(webClientId);

export const googleAuthMissingConfigMessage =
  Platform.OS === 'android'
    ? 'Missing Google auth config. Set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (Android OAuth client) and restart Expo.'
    : Platform.OS === 'ios'
      ? 'Missing Google auth config. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID and restart Expo.'
      : 'Missing Google auth config. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (Web OAuth client) and restart Expo.';
