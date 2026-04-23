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

export default function TicketsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Raised Tickets</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.emptyState}>
           <View style={styles.iconCircle}>
              <Ionicons name="ticket-outline" size={48} color={theme.primary} />
           </View>
           <Text style={styles.emptyTitle}>No Active Tickets</Text>
           <Text style={styles.emptyDesc}>If you&apos;re facing any issues with your orders or account, you can raise a support ticket.</Text>
           
           <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
             <Ionicons name="chatbubbles" size={20} color="#fff" style={{marginRight: 8}} />
             <Text style={styles.primaryBtnText}>Need Help?</Text>
           </TouchableOpacity>
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
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  emptyState: { alignItems: 'center', backgroundColor: theme.surface, padding: 30, borderRadius: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.topBg, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: FontFamily.bold, color: '#000', marginBottom: 8 },
  emptyDesc: { fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  primaryBtn: { flexDirection: 'row', backgroundColor: theme.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 25, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.bold }
});
