import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMe } from '../../src/api/services';

import { Images, Icons } from '../../constants/Assets';
import { Colors, FontFamily } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchMe();
      if (data && data.data) {
        setUser({ 
          name: data.data.name, 
          email: data.data.email, 
          role: data.data.role 
        });
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.userInfoSection}>
        <View style={styles.avatarContainer}>
          <Image source={Images.logo} style={styles.avatar} />
        </View>
        <Text style={styles.userName}>{user.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.menuSection}>
        {user.role === 'admin' && (
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/admin' as any)}
          >
            <View style={styles.menuItemLeft}>
              <Image source={Icons.store} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Admin Panel (Pro)</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
          <View style={styles.menuItemLeft}>
            <Image source={Icons.bucket} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>My Orders</Text>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/bulk-order/my-orders' as any)}>
          <View style={styles.menuItemLeft}>
            <Image source={Icons.store} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>My Bulk Orders</Text>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/bulk-order')}>
          <View style={styles.menuItemLeft}>
            <Image source={Icons.delivery} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Request Bulk Order</Text>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#1c1c1c' },
  userInfoSection: { alignItems: 'center', padding: 30, backgroundColor: '#fff', marginBottom: 20 },
  avatarContainer: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  userName: { fontSize: 22, fontFamily: FontFamily.bold, color: '#1c1c1c', marginBottom: 5 },
  userEmail: { fontSize: 14, fontFamily: FontFamily.regular, color: '#666' },
  menuSection: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f4f4f4' 
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 24, height: 24, marginRight: 15, tintColor: Colors.light.tint },
  menuItemText: { fontSize: 16, fontFamily: FontFamily.medium, color: '#333' },
  menuItemArrow: { fontSize: 24, color: '#ccc', fontFamily: FontFamily.regular },
  logoutItem: { borderBottomWidth: 0, marginTop: 20, backgroundColor: '#fff' },
  logoutText: { fontSize: 16, color: 'red', fontFamily: FontFamily.bold },
});
