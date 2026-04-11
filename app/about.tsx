import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '../constants/theme';

const theme = {
  primary: '#008e42',
  topBg: '#e9f5ed',
  surface: '#ffffff',
  surfaceLow: '#f4f6f5',
  onSurface: '#1a1d1e',
  onSurfaceVariant: '#6e7774',
};

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>About Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.contentCard}>
           <View style={styles.logoBubble}>
             <Ionicons name="leaf" size={40} color={theme.primary} />
           </View>
           <Text style={styles.brandTitle}>GRIHGO</Text>
           <Text style={styles.versionText}>Version 1.0.49</Text>
           
           <Text style={styles.description}>
             GRIHGO is your premium destination for hyper-local rapid grocery delivery. We connect you with verified local suppliers to bring fresh produce, daily essentials, and custom bulk orders straight to your doorstep in minutes.
           </Text>
           
           <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                 <Ionicons name="logo-instagram" size={24} color={theme.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                 <Ionicons name="logo-twitter" size={24} color={theme.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                 <Ionicons name="mail-outline" size={24} color={theme.onSurfaceVariant} />
              </TouchableOpacity>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.surfaceLow },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, backgroundColor: theme.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: FontFamily.bold, color: theme.onSurface },
  container: { flex: 1, padding: 15 },
  
  contentCard: { backgroundColor: theme.surface, padding: 30, alignItems: 'center', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  logoBubble: { width: 80, height: 80, borderRadius: 25, backgroundColor: theme.topBg, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  brandTitle: { fontSize: 24, fontFamily: FontFamily.extraBold, color: '#000', marginBottom: 4 },
  versionText: { fontSize: 13, fontFamily: FontFamily.bold, color: theme.primary, marginBottom: 25 },
  description: { fontSize: 15, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  
  socialRow: { flexDirection: 'row', gap: 20 },
  socialBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: theme.surfaceLow, justifyContent: 'center', alignItems: 'center' }
});
