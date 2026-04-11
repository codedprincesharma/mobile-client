import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
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

export default function PrivacyScreen() {
  const router = useRouter();

  const PolicyItem = ({ icon, title, desc }: any) => (
    <View style={styles.policyItem}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.policyTitle}>{title}</Text>
        <Text style={styles.policyDesc}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Account Privacy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
         <PolicyItem icon="lock-closed" title="End-to-end Encryption" desc="Your personal data and payment methods are securely encrypted in our database." />
         <PolicyItem icon="shield-checkmark" title="No Data Selling" desc="We do not sell your personal demographic data to third-party ad networks." />
         <PolicyItem icon="trash" title="Right to Delete" desc="You can permanently delete your account and all associated data." />
         
         <TouchableOpacity style={styles.dangerBtn}>
            <Text style={styles.dangerText}>Request Account Deletion</Text>
         </TouchableOpacity>
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
  
  policyItem: { flexDirection: 'row', backgroundColor: theme.surface, padding: 20, borderRadius: 16, marginBottom: 15 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.topBg, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textBox: { flex: 1 },
  policyTitle: { fontSize: 16, fontFamily: FontFamily.bold, color: '#000', marginBottom: 4 },
  policyDesc: { fontSize: 13, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, lineHeight: 20 },
  
  dangerBtn: { marginTop: 20, padding: 15, alignItems: 'center' },
  dangerText: { fontSize: 15, fontFamily: FontFamily.bold, color: '#e74c3c' }
});
