import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Share } from 'react-native';
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

export default function ReferScreen() {
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Hey! Join me on GRIHGO and get ₹50 off your first grocery order! Use code: CHOUDHRY50',
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Refer & Earn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
           <View style={styles.iconCircle}>
              <Ionicons name="gift" size={48} color={theme.primary} />
           </View>
           <Text style={styles.heroTitle}>Invite Friends & Earn</Text>
           <Text style={styles.heroDesc}>Get ₹50 in your GRIHGO wallet for every friend who signs up and completes their first order.</Text>
           
           <View style={styles.codeBox}>
             <Text style={styles.codeLabel}>Your invite code</Text>
             <Text style={styles.codeText}>CHOUDHRY50</Text>
           </View>

           <TouchableOpacity style={styles.primaryBtn} onPress={handleShare} activeOpacity={0.8}>
             <Ionicons name="share-social" size={20} color="#fff" style={{marginRight: 8}} />
             <Text style={styles.primaryBtnText}>Share Code</Text>
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
  container: { flex: 1, padding: 15 },
  
  heroCard: { backgroundColor: theme.surface, padding: 30, alignItems: 'center', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.topBg, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 22, fontFamily: FontFamily.bold, color: '#000', marginBottom: 10 },
  heroDesc: { fontSize: 14, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  
  codeBox: { width: '100%', backgroundColor: theme.surfaceLow, padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 25, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d8d5' },
  codeLabel: { fontSize: 12, fontFamily: FontFamily.bold, color: theme.onSurfaceVariant, textTransform: 'uppercase', marginBottom: 4 },
  codeText: { fontSize: 24, fontFamily: FontFamily.extraBold, color: theme.onSurface, letterSpacing: 2 },

  primaryBtn: { flexDirection: 'row', width: '100%', justifyContent: 'center', backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: FontFamily.bold }
});
