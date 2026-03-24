import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect, useSegments, Slot } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartProvider } from '../src/context/CartContext';
import { SocketProvider } from '../src/context/SocketContext';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();

  const [loaded] = useFonts({
    'Okra-Regular': require('../assets/fonts/Okra-Regular.ttf'),
    'Okra-Medium': require('../assets/fonts/Okra-Medium.ttf'),
    'Okra-Bold': require('../assets/fonts/Okra-Bold.ttf'),
    'Okra-ExtraBold': require('../assets/fonts/Okra-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  if (!loaded || isAuthenticated === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  } else if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <CartProvider>
      <SocketProvider>
        <Slot />
      </SocketProvider>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
