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

export default function WalletScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>GRIHGO Money</Text>
        <TouchableOpacity style={styles.historyBtn}>
           <Ionicons name="time-outline" size={24} color={theme.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.balanceCard}>
           <Text style={styles.balanceLabel}>Available Balance</Text>
           <Text style={styles.balanceAmount}>₹0.00</Text>
           
           <TouchableOpacity style={styles.addMoneyBtn} activeOpacity={0.8}>
             <Ionicons name="add-circle-outline" size={20} color="#fff" style={{marginRight: 6}} />
             <Text style={styles.addMoneyText}>Add Money</Text>
           </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
           <Text style={styles.infoTitle}>Why use GRIHGO Money?</Text>
           <View style={styles.infoRow}>
              <Ionicons name="flash" size={20} color="#f1c40f" />
              <Text style={styles.infoText}>1-click lightning fast checkout</Text>
           </View>
           <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color="#27ae60" />
              <Text style={styles.infoText}>100% secure and safe</Text>
           </View>
           <View style={styles.infoRow}>
              <Ionicons name="refresh" size={20} color={theme.primary} />
              <Text style={styles.infoText}>Instant refunds on cancellations</Text>
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
  historyBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: FontFamily.bold, color: theme.onSurface },
  container: { flex: 1 },
  
  balanceCard: { backgroundColor: theme.surface, padding: 30, alignItems: 'center', margin: 15, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  balanceLabel: { fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, marginBottom: 10 },
  balanceAmount: { fontSize: 36, fontFamily: FontFamily.extraBold, color: '#000', marginBottom: 25 },
  addMoneyBtn: { flexDirection: 'row', backgroundColor: theme.primary, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  addMoneyText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.bold },

  infoSection: { paddingHorizontal: 20, marginTop: 10 },
  infoTitle: { fontSize: 16, fontFamily: FontFamily.bold, color: '#000', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#fff', padding: 15, borderRadius: 12 },
  infoText: { fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurface, marginLeft: 12 }
});
