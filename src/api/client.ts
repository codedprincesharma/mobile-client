import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS simulator/web
// Replace with your actual connected WiFi IP if testing on physical device (e.g. 192.168.x.x)
export const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

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
