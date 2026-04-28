import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get API URL from environment variables or use platform-specific defaults
const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://10.0.2.2:5000/api';
  }
  return process.env.EXPO_PUBLIC_API_URL_DEFAULT || 'http://localhost:5000/api';
};

export const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If token is invalid or expired, log user out automatically
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('token');
      // Expo router navigation handled per-component or custom hook
    }
    return Promise.reject(error);
  }
);

export default api;
