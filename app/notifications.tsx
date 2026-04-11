import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Switch } from 'react-native';
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

export default function NotificationsScreen() {
  const router = useRouter();
  const [promos, setPromos] = useState(true);
  const [orders, setOrders] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);

  const ToggleRow = ({ icon, title, desc, value, onValueChange }: any) => (
    <View style={styles.toggleRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Switch 
         trackColor={{ false: '#d1d8d5', true: '#d1d8d5' }}
         thumbColor={value ? theme.primary : '#fff'}
         value={value}
         onValueChange={onValueChange}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
         <ToggleRow 
           icon="pricetag" 
           title="Offers & Promotions" 
           desc="Receive updates on discounts, sales, and special GRIHGO offers."
           value={promos}
           onValueChange={setPromos}
         />
         <ToggleRow 
           icon="cube" 
           title="Order Updates" 
           desc="Get real-time tracking and delivery updates for your orders."
           value={orders}
           onValueChange={setOrders}
         />
         <ToggleRow 
           icon="logo-whatsapp" 
           title="WhatsApp Alerts" 
           desc="Receive important alerts and support directly on WhatsApp."
           value={whatsapp}
           onValueChange={setWhatsapp}
         />
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
  
  toggleRow: { flexDirection: 'row', backgroundColor: theme.surface, padding: 20, borderRadius: 16, marginBottom: 15, alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.topBg, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textBox: { flex: 1, paddingRight: 15 },
  toggleTitle: { fontSize: 16, fontFamily: FontFamily.bold, color: '#000', marginBottom: 4 },
  toggleDesc: { fontSize: 13, fontFamily: FontFamily.medium, color: theme.onSurfaceVariant, lineHeight: 20 },
});
