import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Images, Icons } from '../../constants/Assets';

const activeColor = '#008e42'; // Primary green
const inactiveColor = '#9da39f'; 

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarShowLabel: false, // Ensure no text labels as per UI
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f4f6f5',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
        },
      }}>
      
      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "home" : "home-outline"} 
              size={30} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* 2. Categories / Discovery */}
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "leaf" : "leaf-outline"} 
              size={26} 
              color={color} 
              style={{ transform: [{ rotate: '-45deg' }] }}
            />
          ),
        }}
      />

      {/* 3. Floating Action Button (Cart) */}
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.floatingButtonContainer}>
              <View style={styles.floatingButton}>
                 <Image 
                   source={Images.logo} 
                   style={styles.floatingLogo} 
                 />
              </View>
            </View>
          ),
        }}
      />

      {/* 4. Orders / Calendar */}
      <Tabs.Screen
        name="order-again"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    top: -20, // Elevate above the tab bar
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: activeColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: activeColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#ffffff', // White border cuts into the background
  },
  floatingLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#ffffff', // Make the logo white if possible
  }
});
